<?php

declare(strict_types=1);

// Gemeinsamer Einstieg aller Endpoints. Liegt im gesperrten Verzeichnis _app/ (kein HTTP-Zugriff).

use Goekbau\Forms\Config;
use Goekbau\Forms\Http\JsonResponse;
use Goekbau\Forms\Mail\MessageComposer;
use Goekbau\Forms\Mail\SmtpMailer;
use Goekbau\Forms\Monitoring\Log;
use Goekbau\Forms\Monitoring\Stats;
use Goekbau\Forms\Security\FormToken;
use Goekbau\Forms\Security\Keys;
use Goekbau\Forms\Spam\AltchaGuard;
use Goekbau\Forms\Spam\ContentFilter;
use Goekbau\Forms\Spam\RateLimiter;
use Goekbau\Forms\Storage\FileStore;
use Goekbau\Forms\SubmitHandler;
use Goekbau\Forms\Upload\MalwareBazaarLookup;
use Goekbau\Forms\Upload\UploadInspector;
use Goekbau\Forms\Validation\EmailDomainCheck;
use Goekbau\Forms\Validation\FieldValidator;

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);
header_remove('X-Powered-By');

require dirname(__DIR__) . '/vendor/autoload.php';

/** Generische Antwort ohne interne Details (web-security „Server-Härtung“). */
function goekbau_fail(int $status, string $message): never
{
    (new JsonResponse($status, ['ok' => false, 'message' => $message]))->send();
    exit;
}

set_exception_handler(static function (Throwable $e): void {
    error_log('goekbau-forms: ' . get_class($e));
    goekbau_fail(500, 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder rufen Sie uns an.');
});

final class GoekbauApp
{
    public readonly Config $config;
    public readonly FileStore $store;
    public readonly Keys $keys;

    public function __construct()
    {
        $this->config = Config::load(__DIR__);
        $missing = $this->config->missing();
        if ($missing) {
            // delivery-pipeline: ohne vollständige Konfiguration kein Betrieb – Details nur ins Server-Log
            error_log('goekbau-forms: Konfiguration unvollständig: ' . implode(', ', $missing));
            goekbau_fail(503, 'Das Formular ist vorübergehend nicht verfügbar. Bitte rufen Sie uns an oder schreiben Sie uns eine E-Mail.');
        }
        $this->store = new FileStore($this->storageDir() . '/kv');
        $this->keys = new Keys($this->config->require('GOEKBAU_SECRET'));
    }

    public function storageDir(): string
    {
        $configured = $this->config->get('GOEKBAU_STORAGE_DIR');
        // _app/app/ liegt im Artefakt unter dist/site/ → dist/storage ist außerhalb des Document Roots
        $outsideDocroot = dirname(__DIR__, 3) . '/storage';
        foreach (array_filter([$configured, $outsideDocroot, __DIR__ . '/storage']) as $dir) {
            if ((is_dir($dir) || @mkdir($dir, 0700, true)) && is_writable($dir)) {
                return $dir;
            }
        }
        throw new RuntimeException('kein beschreibbarer Speicher');
    }

    public function formTokens(): FormToken
    {
        return new FormToken($this->keys->for('form-token'));
    }

    public function altcha(): AltchaGuard
    {
        return new AltchaGuard($this->keys->for('altcha'), $this->store);
    }

    public function rateLimiter(): RateLimiter
    {
        return new RateLimiter($this->store, $this->keys->for('ip-salt'));
    }

    public function stats(): Stats
    {
        return new Stats($this->store);
    }

    public function validator(): FieldValidator
    {
        $deployed = __DIR__ . '/forms.json';
        return FieldValidator::fromFile(is_file($deployed) ? $deployed : dirname(__DIR__, 2) . '/shared/forms.json');
    }

    public function submitHandler(): SubmitHandler
    {
        $c = $this->config;
        $validator = $this->validator();
        $limits = $validator->limits();
        $tmp = $this->storageDir() . '/tmp';
        if (!is_dir($tmp)) {
            @mkdir($tmp, 0700, true);
        }
        $recipients = [
            'contact' => $c->require('GOEKBAU_MAIL_TO_CONTACT'),
            'application' => $c->require('GOEKBAU_MAIL_TO_APPLICATION'),
        ];
        if ($c->get('GOEKBAU_MAIL_TO_MONITOR')) {
            $recipients['monitor'] = $c->get('GOEKBAU_MAIL_TO_MONITOR');
        }
        return new SubmitHandler(
            allowedOrigins: $c->allowedOrigins(),
            tokens: $this->formTokens(),
            altcha: $this->altcha(),
            rateLimiter: $this->rateLimiter(),
            validator: $validator,
            emailCheck: EmailDomainCheck::withList(__DIR__ . '/data/disposable-domains.txt'),
            contentFilter: ContentFilter::withList(__DIR__ . '/data/blocked-words.txt', $this->store),
            uploads: new UploadInspector(
                maxFiles: (int) $limits['maxFiles'],
                maxTotalBytes: (int) $limits['maxTotalBytes'],
                malware: new MalwareBazaarLookup($c->get('GOEKBAU_MALWAREBAZAAR_KEY')),
                tmpDir: $tmp,
            ),
            composer: new MessageComposer(),
            mailer: new SmtpMailer(
                host: $c->require('GOEKBAU_SMTP_HOST'),
                port: (int) $c->require('GOEKBAU_SMTP_PORT'),
                user: $c->require('GOEKBAU_SMTP_USER'),
                pass: $c->require('GOEKBAU_SMTP_PASS'),
                secure: $c->get('GOEKBAU_SMTP_SECURE', 'tls') ?? 'tls',
                from: $c->require('GOEKBAU_MAIL_FROM'),
                fromName: $c->get('GOEKBAU_MAIL_FROM_NAME', 'Website goekbau.de') ?? 'Website goekbau.de',
                // Nur für den lokalen Mailpit-Nachbau abschaltbar; Produktion prüft immer
                verifyPeer: $c->isProduction() || $c->get('GOEKBAU_SMTP_VERIFY_PEER', '1') !== '0',
            ),
            recipients: $recipients,
            log: new Log($this->storageDir() . '/logs'),
            stats: $this->stats(),
            monitorToken: $c->get('GOEKBAU_MONITOR_TOKEN'),
        );
    }
}
