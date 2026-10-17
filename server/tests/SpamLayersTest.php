<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests;

use AltchaOrg\Altcha\V1\Altcha;
use AltchaOrg\Altcha\V1\Hasher\Algorithm;
use Goekbau\Forms\Security\FormToken;
use Goekbau\Forms\Spam\AltchaGuard;
use Goekbau\Forms\Spam\RateLimiter;
use Goekbau\Forms\Storage\FileStore;
use Goekbau\Forms\Validation\EmailDomainCheck;
use PHPUnit\Framework\TestCase;

/** spam-protection: ALTCHA, Formular-Token, Rate-Limit, Absenderadresse. */
final class SpamLayersTest extends TestCase
{
    private string $dir;

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/goek-spam-' . bin2hex(random_bytes(4));
    }

    protected function tearDown(): void
    {
        foreach (glob($this->dir . '/*') ?: [] as $f) {
            @unlink($f);
        }
        @rmdir($this->dir);
    }

    /** Löst eine Challenge wie der Browser (SHA-256 über salt + Zahl). */
    public static function solve(array $challenge): string
    {
        $solution = (new Altcha('egal'))->solveChallenge($challenge['challenge'], $challenge['salt'], Algorithm::SHA256, $challenge['maxnumber']);
        self::assertNotNull($solution);
        return base64_encode((string) json_encode([
            'algorithm' => $challenge['algorithm'],
            'challenge' => $challenge['challenge'],
            'number' => $solution->number,
            'salt' => $challenge['salt'],
            'signature' => $challenge['signature'],
        ]));
    }

    public function testAltchaGueltigeLoesungWirdGenauEinmalAngenommen(): void
    {
        $guard = new AltchaGuard(str_repeat('k', 32), new FileStore($this->dir));
        $payload = self::solve($guard->challenge(2000));
        self::assertTrue($guard->verify($payload));
        self::assertFalse($guard->verify($payload), 'Wiederverwendung muss abgelehnt werden');
    }

    public function testAltchaManipulierteOderFremdeSignaturWirdAbgelehnt(): void
    {
        $guard = new AltchaGuard(str_repeat('k', 32), new FileStore($this->dir));
        $foreign = new AltchaGuard(str_repeat('x', 32), new FileStore($this->dir . '-f'));
        self::assertFalse($guard->verify(self::solve($foreign->challenge(2000))));
        $data = json_decode((string) base64_decode(self::solve($guard->challenge(2000))), true);
        $data['number']++;
        self::assertFalse($guard->verify(base64_encode((string) json_encode($data))));
        self::assertFalse($guard->verify(''));
        self::assertFalse($guard->verify('kein-base64'));
    }

    public function testFormTokenSignaturUndZeitstempel(): void
    {
        $tokens = new FormToken(str_repeat('t', 32));
        $token = $tokens->issue('contact', 1_000_000);
        self::assertSame(['formId' => 'contact', 'issuedAt' => 1_000_000], $tokens->verify($token));
        self::assertNull($tokens->verify(str_replace('contact', 'application', $token)));
        self::assertNull((new FormToken(str_repeat('o', 32)))->verify($token));
        self::assertNull($tokens->verify('contact.1.2'));
    }

    public function testRateLimitSechsterVersuchProStundeWirdMitWartezeitAbgelehnt(): void
    {
        $limiter = new RateLimiter(new FileStore($this->dir), 'salz');
        $key = $limiter->hash('203.0.113.7');
        $now = 1_700_000_000;
        for ($i = 0; $i < 5; $i++) {
            self::assertNull($limiter->hit('ip', $key, [[3600, 5], [86400, 20]], $now + $i));
        }
        $retry = $limiter->hit('ip', $key, [[3600, 5], [86400, 20]], $now + 10);
        self::assertNotNull($retry);
        self::assertGreaterThan(3500, $retry);
        self::assertNull($limiter->hit('ip', $key, [[3600, 5], [86400, 20]], $now + 3601), 'nach einer Stunde wieder frei');
    }

    public function testRateLimitSpeichertKeineKlartextIp(): void
    {
        $limiter = new RateLimiter(new FileStore($this->dir), 'salz');
        $limiter->hit('ip', $limiter->hash('203.0.113.7'), [[3600, 5]]);
        foreach (glob($this->dir . '/*') ?: [] as $file) {
            self::assertStringNotContainsString('203.0.113.7', (string) file_get_contents($file));
            self::assertStringNotContainsString('203.0.113.7', basename($file));
        }
    }

    public function testAbsenderadresse(): void
    {
        $check = new EmailDomainCheck(['wegwerfmail.de', 'mailinator.com'], fn (string $d) => $d !== 'gibts-nicht-xyz123.de');
        self::assertNull($check->check('max@example.org'));
        self::assertSame('disposable', $check->check('max@mailinator.com'));
        self::assertSame('disposable', $check->check('max@sub.wegwerfmail.de'));
        self::assertSame('unreachable', $check->check('max@gibts-nicht-xyz123.de'));
    }

    public function testWegwerfListeIstGeladenUndEnthaeltKeineGaengigenAnbieter(): void
    {
        $check = EmailDomainCheck::withList(dirname(__DIR__) . '/app/data/disposable-domains.txt');
        $resolverAlwaysOk = new \ReflectionProperty($check, 'disposable');
        $list = $resolverAlwaysOk->getValue($check);
        self::assertGreaterThan(1000, count($list));
        foreach (['gmail.com', 'web.de', 'gmx.de', 't-online.de', 'outlook.com', 'yahoo.de', 'icloud.com', 'goekbau.de'] as $mainstream) {
            self::assertArrayNotHasKey($mainstream, $list, $mainstream);
        }
    }
}
