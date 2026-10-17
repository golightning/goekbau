<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests;

use Goekbau\Forms\Http\Request;
use Goekbau\Forms\Mail\MessageComposer;
use Goekbau\Forms\Monitoring\Log;
use Goekbau\Forms\Monitoring\Stats;
use Goekbau\Forms\Security\FormToken;
use Goekbau\Forms\Spam\AltchaGuard;
use Goekbau\Forms\Spam\ContentFilter;
use Goekbau\Forms\Spam\RateLimiter;
use Goekbau\Forms\Storage\FileStore;
use Goekbau\Forms\SubmitHandler;
use Goekbau\Forms\Tests\Support\Corpus;
use Goekbau\Forms\Tests\Support\FakeMailer;
use Goekbau\Forms\Tests\Support\FakeMalwareLookup;
use Goekbau\Forms\Upload\UploadInspector;
use Goekbau\Forms\Validation\EmailDomainCheck;
use Goekbau\Forms\Validation\FieldValidator;
use PHPUnit\Framework\TestCase;

/** Pipeline-Reihenfolge und Endpunkt-Verhalten (form-submissions, spam-protection, web-security). */
final class SubmitHandlerTest extends TestCase
{
    private const ORIGIN = 'https://www.goekbau.de';
    private const NOW = 1_800_000_000;

    private Corpus $corpus;
    private string $storage;
    private FakeMailer $mailer;
    private FakeMalwareLookup $malware;
    private FormToken $tokens;
    private AltchaGuard $altcha;

    protected function setUp(): void
    {
        $this->corpus = new Corpus();
        $this->storage = $this->corpus->dir . '-store';
        $this->mailer = new FakeMailer();
        $this->malware = new FakeMalwareLookup();
        $this->tokens = new FormToken(str_repeat('t', 32));
        $this->altcha = new AltchaGuard(str_repeat('a', 32), new FileStore($this->storage . '/kv'));
    }

    protected function tearDown(): void
    {
        $this->corpus->cleanup();
        exec('rm -rf ' . escapeshellarg($this->storage));
    }

    private function handler(?FakeMailer $mailer = null): SubmitHandler
    {
        $store = new FileStore($this->storage . '/kv');
        return new SubmitHandler(
            allowedOrigins: [self::ORIGIN],
            tokens: $this->tokens,
            altcha: $this->altcha,
            rateLimiter: new RateLimiter($store, 'salz'),
            validator: FieldValidator::fromFile(dirname(__DIR__, 2) . '/shared/forms.json'),
            emailCheck: new EmailDomainCheck(['mailinator.com'], fn () => true),
            contentFilter: new ContentFilter(['casino'], $store),
            uploads: new UploadInspector(5, 10 * 1024 * 1024, $this->malware, $this->storage, fn () => true),
            composer: new MessageComposer(),
            mailer: $mailer ?? $this->mailer,
            recipients: ['contact' => 'info@goekbau.de', 'application' => 'deniz.goek@goekbau.de', 'monitor' => 'monitor@golightning.ai'],
            log: new Log($this->storage . '/logs'),
            stats: new Stats($store),
            monitorToken: str_repeat('m', 40),
        );
    }

    /**
     * @param array<string, string> $overrides
     * @param array<string, string> $headers
     */
    private function request(string $form = 'contact', array $overrides = [], array $files = [], array $headers = [], string $method = 'POST', ?int $issuedAt = null): Request
    {
        $post = [
            SubmitHandler::CSRF_FIELD => $this->tokens->issue($form, $issuedAt ?? self::NOW - 30),
            'altcha' => SpamLayersTest::solve($this->altcha->challenge(2000)),
            'name' => 'Max Muster',
            'email' => 'max@example.org',
            'phone' => '',
            'message' => 'Wir planen eine Baumaßnahme im Frühjahr.',
            'privacy' => 'on',
        ];
        if ($form === 'application') {
            $post['position'] = 'Fachbauüberwacher Oberbau';
        }
        return new Request(
            $method,
            array_merge($post, $overrides),
            $files,
            array_merge(['origin' => self::ORIGIN], $headers),
            '198.51.100.23',
            2000,
            'multipart/form-data; boundary=x',
        );
    }

    private function pdfUpload(string $bytes = ''): array
    {
        $p = $this->corpus->file('cv.pdf', $bytes !== '' ? $bytes : Corpus::pdf());
        return ['files' => ['name' => ['cv.pdf'], 'tmp_name' => [$p], 'size' => [filesize($p)], 'error' => [UPLOAD_ERR_OK]]];
    }

    public function testGueltigeKontaktanfrageWirdZugestellt(): void
    {
        $res = $this->handler()->handle($this->request(), self::NOW);
        self::assertSame(200, $res->status);
        self::assertTrue($res->body['ok']);
        self::assertCount(1, $this->mailer->sent);
        self::assertSame('info@goekbau.de', $this->mailer->sent[0]->to);
        self::assertSame('max@example.org', $this->mailer->sent[0]->replyTo);
    }

    public function testGueltigeBewerbungMitZweiPdfs(): void
    {
        $a = $this->pdfUpload();
        $b = $this->pdfUpload();
        $files = ['files' => [
            'name' => ['lebenslauf.pdf', 'zeugnis.pdf'],
            'tmp_name' => [$a['files']['tmp_name'][0], $b['files']['tmp_name'][0]],
            'size' => [100, 100],
            'error' => [0, 0],
        ]];
        $res = $this->handler()->handle($this->request('application', [], $files), self::NOW);
        self::assertSame(200, $res->status, json_encode($res->body));
        self::assertCount(2, $this->mailer->sent[0]->attachments);
        self::assertStringContainsString('Bewerbung: Fachbauüberwacher Oberbau', $this->mailer->sent[0]->subject);
        self::assertSame('deniz.goek@goekbau.de', $this->mailer->sent[0]->to);
    }

    public function testNachDemVersandLiegenKeineAnhaengeMehrAufDemServer(): void
    {
        $files = $this->pdfUpload();
        $tmp = $files['files']['tmp_name'][0];
        $this->handler()->handle($this->request('application', [], $files), self::NOW);
        self::assertFileDoesNotExist($tmp);
        $fail = $this->pdfUpload(Corpus::pdfWithJavaScript());
        $this->handler()->handle($this->request('application', [], $fail), self::NOW);
        self::assertFileDoesNotExist($fail['files']['tmp_name'][0]);
        self::assertSame([], glob($this->storage . '/img*') ?: []);
    }

    public function testGetWirdMit405Abgelehnt(): void
    {
        $res = $this->handler()->handle($this->request(method: 'GET'), self::NOW);
        self::assertSame(405, $res->status);
        self::assertSame('POST', $res->headers['Allow']);
    }

    public function testFremderOriginWirdMit403Abgelehnt(): void
    {
        $res = $this->handler()->handle($this->request(headers: ['origin' => 'https://evil.example']), self::NOW);
        self::assertSame(403, $res->status);
        self::assertSame([], $this->mailer->sent);
    }

    public function testFehlendesOderGefaelschtesTokenWirdAbgelehnt(): void
    {
        $res = $this->handler()->handle($this->request(overrides: [SubmitHandler::CSRF_FIELD => 'contact.1.x.y']), self::NOW);
        self::assertSame(403, $res->status);
    }

    public function testHoneypotAntwortetErfolgreichOhneVersand(): void
    {
        $res = $this->handler()->handle($this->request(overrides: [SubmitHandler::HONEYPOT => 'http://spam.example']), self::NOW);
        self::assertSame(200, $res->status);
        self::assertTrue($res->body['ok']);
        self::assertSame([], $this->mailer->sent);
    }

    public function testZuSchnellAbgesendetWirdVerworfen(): void
    {
        $res = $this->handler()->handle($this->request(issuedAt: self::NOW - 1), self::NOW);
        self::assertSame(422, $res->status);
        self::assertSame([], $this->mailer->sent);
        $old = $this->handler()->handle($this->request(issuedAt: self::NOW - 8000), self::NOW);
        self::assertSame(422, $old->status);
    }

    public function testOhneAltchaKeinVersand(): void
    {
        $res = $this->handler()->handle($this->request(overrides: ['altcha' => '']), self::NOW);
        self::assertSame(422, $res->status);
        self::assertSame([], $this->mailer->sent);
    }

    public function testSechsteAnfrageProStundeErgibt429MitRetryAfter(): void
    {
        $handler = $this->handler();
        for ($i = 0; $i < 5; $i++) {
            $res = $handler->handle($this->request(overrides: ['email' => "max{$i}@example.org", 'message' => "Anfrage Nummer {$i} mit Text"]), self::NOW);
            self::assertSame(200, $res->status, json_encode($res->body));
        }
        $res = $handler->handle($this->request(overrides: ['email' => 'max9@example.org', 'message' => 'Noch eine Anfrage mit Text']), self::NOW);
        self::assertSame(429, $res->status);
        self::assertArrayHasKey('Retry-After', $res->headers);
        self::assertCount(5, $this->mailer->sent);
    }

    public function testFeldfehlerErgeben422MitFeldbezug(): void
    {
        $res = $this->handler()->handle($this->request(overrides: ['email' => 'max@']), self::NOW);
        self::assertSame(422, $res->status);
        self::assertObjectHasProperty('email', $res->body['errors']);
    }

    public function testWegwerfadresseUndSpamInhaltWerdenAbgelehnt(): void
    {
        self::assertSame(422, $this->handler()->handle($this->request(overrides: ['email' => 'x@mailinator.com']), self::NOW)->status);
        $spam = 'Besuchen Sie https://a.example https://b.example https://c.example jetzt';
        self::assertSame(422, $this->handler()->handle($this->request(overrides: ['message' => $spam]), self::NOW)->status);
        self::assertSame([], $this->mailer->sent);
    }

    public function testSpamWirdErkanntBevorAnhaengeVerarbeitetWerden(): void
    {
        $files = $this->pdfUpload();
        $res = $this->handler()->handle($this->request('application', ['altcha' => ''], $files), self::NOW);
        self::assertSame(422, $res->status);
        self::assertSame(0, $this->malware->calls, 'Uploads dürfen bei Spam nicht inhaltlich verarbeitet werden');
    }

    public function testSmtpFehlerErgibt502MitAlternativemKontaktweg(): void
    {
        $res = $this->handler(new FakeMailer(fail: true))->handle($this->request(), self::NOW);
        self::assertSame(502, $res->status);
        self::assertStringContainsString('telefonisch', $res->body['message']);
    }

    public function testZuGrosserRequestWirdMit413Abgelehnt(): void
    {
        $r = $this->request();
        $big = new Request($r->method, $r->post, $r->files, $r->headers, $r->remoteAddr, 12 * 1024 * 1024, $r->contentType);
        self::assertSame(413, $this->handler()->handle($big, self::NOW)->status);
    }

    public function testMonitorAnfrageGehtAnAgenturadresse(): void
    {
        $res = $this->handler()->handle($this->request(overrides: ['altcha' => ''], headers: ['x-monitor-token' => str_repeat('m', 40)]), self::NOW);
        self::assertSame(200, $res->status);
        self::assertSame('monitor@golightning.ai', $this->mailer->sent[0]->to);
        $wrong = $this->handler()->handle($this->request(overrides: ['altcha' => ''], headers: ['x-monitor-token' => str_repeat('x', 40)]), self::NOW);
        self::assertSame(422, $wrong->status);
    }

    public function testLogEnthaeltKeinePersonenbezogenenDaten(): void
    {
        $this->handler()->handle($this->request('application', ['name' => 'Erika Geheim', 'email' => 'erika.geheim@example.org'], $this->pdfUpload()), self::NOW);
        $this->handler()->handle($this->request(overrides: ['email' => 'kaputt@']), self::NOW);
        $log = implode('', array_map('file_get_contents', glob($this->storage . '/logs/*.log') ?: []));
        self::assertNotSame('', $log);
        foreach (['Erika', 'Geheim', 'erika.geheim', 'example.org', 'cv.pdf', '198.51.100.23', 'kaputt'] as $secret) {
            self::assertStringNotContainsString($secret, $log, $secret);
        }
    }
}
