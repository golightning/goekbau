<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests;

use Goekbau\Forms\Config;
use PHPUnit\Framework\TestCase;

/** delivery-pipeline „Geheimnisse außerhalb des Codes“ / Task 7.3: ohne vollständige Konfiguration kein Betrieb. */
final class ConfigTest extends TestCase
{
    public function testFehlendeWerteWerdenGemeldet(): void
    {
        $missing = Config::fromArray(['GOEKBAU_SECRET' => 'zu-kurz'])->missing();
        self::assertContains('GOEKBAU_SMTP_HOST', $missing);
        self::assertContains('GOEKBAU_SECRET (mind. 32 Zeichen)', $missing);
    }

    public function testVollstaendigeKonfiguration(): void
    {
        $config = Config::fromArray([
            'GOEKBAU_SECRET' => str_repeat('s', 40),
            'GOEKBAU_ALLOWED_ORIGINS' => 'https://www.goekbau.de, https://goekbau.de',
            'GOEKBAU_SMTP_HOST' => 'smtp.ionos.de', 'GOEKBAU_SMTP_PORT' => '587',
            'GOEKBAU_SMTP_USER' => 'website@goekbau.de', 'GOEKBAU_SMTP_PASS' => 'x',
            'GOEKBAU_MAIL_FROM' => 'website@goekbau.de',
            'GOEKBAU_MAIL_TO_CONTACT' => 'info@goekbau.de', 'GOEKBAU_MAIL_TO_APPLICATION' => 'deniz.goek@goekbau.de',
        ]);
        self::assertSame([], $config->missing());
        self::assertSame(['https://www.goekbau.de', 'https://goekbau.de'], $config->allowedOrigins());
        self::assertTrue($config->isProduction(), 'ohne GOEKBAU_ENV gilt Produktion (sicherer Standard)');
    }
}
