<?php

declare(strict_types=1);

namespace Goekbau\Forms;

use Goekbau\Forms\Http\JsonResponse;
use Goekbau\Forms\Http\Request;
use Goekbau\Forms\Mail\MailDeliveryError;
use Goekbau\Forms\Mail\Mailer;
use Goekbau\Forms\Mail\MessageComposer;
use Goekbau\Forms\Monitoring\Log;
use Goekbau\Forms\Monitoring\Stats;
use Goekbau\Forms\Security\FormToken;
use Goekbau\Forms\Spam\AltchaGuard;
use Goekbau\Forms\Spam\ContentFilter;
use Goekbau\Forms\Spam\RateLimiter;
use Goekbau\Forms\Upload\UploadInspector;
use Goekbau\Forms\Validation\EmailDomainCheck;
use Goekbau\Forms\Validation\FieldValidator;

/**
 * Request-Pipeline (design.md D11). Abbruch an der ersten verletzten Stufe, teure Arbeit (Uploads) zuletzt.
 * 1 Methode/Größe → 2 Herkunft/Token → 3 Honeypot/Zeitfenster → 4 ALTCHA → 5 Rate-Limit →
 * 6 Felder/Adresse/Inhalt → 7 Uploads → 8 Versand → 9 Aufräumen.
 */
final class SubmitHandler
{
    public const HONEYPOT = 'website';
    /** Name nach gängiger Konvention, damit der CSRF-Schutz auch für Scanner/Prüfer erkennbar ist */
    public const CSRF_FIELD = '_csrf_token';

    /**
     * @param list<string> $allowedOrigins
     * @param array<string, string> $recipients Formular-ID → Empfängeradresse
     */
    public function __construct(
        private readonly array $allowedOrigins,
        private readonly FormToken $tokens,
        private readonly AltchaGuard $altcha,
        private readonly RateLimiter $rateLimiter,
        private readonly FieldValidator $validator,
        private readonly EmailDomainCheck $emailCheck,
        private readonly ContentFilter $contentFilter,
        private readonly UploadInspector $uploads,
        private readonly MessageComposer $composer,
        private readonly Mailer $mailer,
        private readonly array $recipients,
        private readonly Log $log,
        private readonly Stats $stats,
        private readonly ?string $monitorToken = null,
    ) {
    }

    public function handle(Request $request, ?int $now = null): JsonResponse
    {
        $now ??= time();
        $form = '-';
        $ipHash = $this->rateLimiter->hash($request->remoteAddr);
        $filesField = is_array($request->files['files'] ?? null) ? $request->files['files'] : [];
        try {
            // 1. Methode und Größe
            if ($request->method !== 'POST') {
                throw new Rejection(405, 'method', 'Methode nicht erlaubt.');
            }
            $limits = $this->validator->limits();
            if ($request->contentLength > (int) $limits['maxRequestBytes']) {
                throw new Rejection(413, 'size', 'Ihre Dateien sind zusammen größer als 10 MB. Bitte verkleinern Sie sie.');
            }
            if (!preg_match('~^(multipart/form-data|application/x-www-form-urlencoded)~i', $request->contentType)) {
                throw new Rejection(415, 'content-type', 'Ungültige Anfrage.');
            }

            // 2. Herkunft und signiertes Formular-Token (CSRF)
            if (!$this->originAllowed($request)) {
                throw new Rejection(403, 'origin', 'Anfrage nicht erlaubt.');
            }
            $token = $this->tokens->verify($request->string(self::CSRF_FIELD));
            if ($token === null || !$this->validator->hasForm($token['formId'])) {
                throw new Rejection(403, 'token', 'Das Formular ist abgelaufen. Bitte laden Sie die Seite neu.');
            }
            $form = $token['formId'];
            $isMonitor = $this->isMonitorRequest($request);

            // 3. Honeypot (scheinbarer Erfolg) und Zeitfenster
            if (trim($request->string(self::HONEYPOT)) !== '') {
                throw Rejection::silent('honeypot');
            }
            $age = $now - $token['issuedAt'];
            if (!$isMonitor && ($age < FormToken::MIN_SECONDS || $age > FormToken::MAX_SECONDS)) {
                throw new Rejection(422, 'timing', 'Bitte senden Sie das Formular erneut ab.');
            }

            // 4. ALTCHA
            if (!$isMonitor && !$this->altcha->verify($request->string('altcha'))) {
                throw new Rejection(422, 'altcha', 'Die automatische Spam-Prüfung ist fehlgeschlagen. Bitte senden Sie das Formular erneut ab.');
            }

            // 5. Rate-Limit: IP 5/h und 20/Tag, E-Mail 3/h
            if (!$isMonitor) {
                $retry = $this->rateLimiter->hit('ip', $ipHash, [[3600, 5], [86400, 20]], $now)
                    ?? $this->rateLimiter->hit('email', $this->rateLimiter->hash($request->string('email')), [[3600, 3]], $now);
                if ($retry !== null) {
                    throw new Rejection(429, 'ratelimit', 'Sie haben in kurzer Zeit mehrere Nachrichten gesendet. Bitte versuchen Sie es später erneut oder rufen Sie uns an.', [], false, $retry);
                }
            }

            // 6. Felder, Absenderadresse, Inhalt
            $fileCount = count(UploadInspector::normalize($filesField));
            $errors = $this->validator->validate($form, $request->post, $fileCount);
            if ($errors) {
                throw new Rejection(422, 'validation', 'Bitte prüfen Sie die markierten Felder.', $errors);
            }
            $fields = $this->validator->clean($form, $request->post);
            if (!$isMonitor) {
                $emailProblem = $this->emailCheck->check($fields['email']);
                if ($emailProblem !== null) {
                    $msg = $emailProblem === 'disposable'
                        ? 'Bitte verwenden Sie eine dauerhafte E-Mail-Adresse, damit wir Ihnen antworten können.'
                        : 'Diese E-Mail-Adresse scheint nicht erreichbar zu sein. Bitte prüfen Sie die Schreibweise.';
                    throw new Rejection(422, 'email-' . $emailProblem, $msg, ['email' => $msg]);
                }
                $spam = $this->contentFilter->check(($fields['message'] ?? '') . "\n" . ($fields['name'] ?? ''));
                if ($spam !== null) {
                    throw new Rejection(422, $spam, 'Ihre Nachricht konnte nicht angenommen werden. Bitte entfernen Sie Links und versuchen Sie es erneut – oder rufen Sie uns an.', ['message' => 'Bitte entfernen Sie Links oder Werbung aus Ihrer Nachricht.']);
                }
            }

            // 7. Uploads (nur Bewerbung)
            $files = $form === 'application' ? $this->uploads->inspect($filesField) : [];

            // 8. Versand
            $to = $isMonitor ? ($this->recipients['monitor'] ?? '') : ($this->recipients[$form] ?? '');
            $message = $form === 'application'
                ? $this->composer->application($fields, $files, $to)
                : $this->composer->contact($fields, $to);
            try {
                $this->mailer->send($message);
            } catch (MailDeliveryError) {
                throw new Rejection(502, 'smtp', 'Ihre Nachricht konnte gerade nicht zugestellt werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch.');
            }

            $outcome = $isMonitor ? 'monitor-ok' : 'accepted';
            $this->log->write($form, 200, $outcome, $ipHash);
            $this->stats->count($outcome);
            return new JsonResponse(200, ['ok' => true, 'message' => $form === 'application'
                ? 'Vielen Dank! Ihre Bewerbung ist bei uns eingegangen. Wir melden uns bei Ihnen.'
                : 'Vielen Dank! Ihre Nachricht ist bei uns eingegangen. Wir melden uns schnellstmöglich.']);
        } catch (Rejection $r) {
            $this->log->write($form, $r->silent ? 200 : $r->status, $r->layer, $ipHash);
            $this->stats->count('rejected-' . $r->layer);
            $headers = $r->retryAfter !== null ? ['Retry-After' => (string) $r->retryAfter] : [];
            if ($r->status === 405) {
                $headers['Allow'] = 'POST';
            }
            return $r->silent
                ? new JsonResponse(200, ['ok' => true, 'message' => $r->userMessage])
                : new JsonResponse($r->status, ['ok' => false, 'message' => $r->userMessage, 'errors' => (object) $r->fieldErrors], $headers);
        } finally {
            // 9. Datensparsamkeit: keine Anhänge bleiben auf dem Server
            $this->uploads->cleanup($filesField);
        }
    }

    private function originAllowed(Request $request): bool
    {
        $origin = $request->header('origin');
        if ($origin === null || $origin === '' || $origin === 'null') {
            $referer = $request->header('referer');
            if ($referer === null) {
                return false;
            }
            $parts = parse_url($referer);
            $origin = isset($parts['scheme'], $parts['host'])
                ? $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '')
                : '';
        }
        return in_array(rtrim($origin, '/'), $this->allowedOrigins, true);
    }

    /** delivery-pipeline/email-security: synthetischer Zustellungstest der Agentur (eigener Empfänger). */
    private function isMonitorRequest(Request $request): bool
    {
        $provided = $request->header('x-monitor-token');
        return $this->monitorToken !== null && strlen($this->monitorToken) >= 32 && $provided !== null
            && hash_equals($this->monitorToken, $provided) && isset($this->recipients['monitor']);
    }
}
