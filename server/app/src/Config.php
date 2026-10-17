<?php

declare(strict_types=1);

namespace Goekbau\Forms;

/**
 * Laufzeitkonfiguration aus Umgebungsvariablen oder _app/config.local.php (Deploy-Now-Runtime-Template).
 * Secrets stehen nie im Repository (delivery-pipeline, email-security).
 */
final class Config
{
    /** @param array<string, string> $values */
    private function __construct(private readonly array $values)
    {
    }

    public static function load(string $appDir): self
    {
        $file = $appDir . '/config.local.php';
        $fromFile = is_file($file) ? (array) require $file : [];
        $keys = [
            'GOEKBAU_ENV', 'GOEKBAU_SECRET', 'GOEKBAU_ALLOWED_ORIGINS', 'GOEKBAU_STORAGE_DIR',
            'GOEKBAU_SMTP_HOST', 'GOEKBAU_SMTP_PORT', 'GOEKBAU_SMTP_USER', 'GOEKBAU_SMTP_PASS', 'GOEKBAU_SMTP_SECURE',
            'GOEKBAU_SMTP_VERIFY_PEER', 'GOEKBAU_MAIL_FROM', 'GOEKBAU_MAIL_FROM_NAME',
            'GOEKBAU_MAIL_TO_CONTACT', 'GOEKBAU_MAIL_TO_APPLICATION', 'GOEKBAU_MAIL_TO_MONITOR',
            'GOEKBAU_MALWAREBAZAAR_KEY', 'GOEKBAU_MONITOR_TOKEN',
        ];
        $values = [];
        foreach ($keys as $key) {
            $env = getenv($key);
            $value = $env !== false && $env !== '' ? $env : ($fromFile[$key] ?? null);
            if (is_string($value) && $value !== '') {
                $values[$key] = $value;
            }
        }
        return new self($values);
    }

    /** @param array<string, string> $values */
    public static function fromArray(array $values): self
    {
        return new self($values);
    }

    public function get(string $key, ?string $default = null): ?string
    {
        return $this->values[$key] ?? $default;
    }

    public function require(string $key): string
    {
        $value = $this->values[$key] ?? null;
        if ($value === null) {
            throw new ConfigurationError("Konfiguration fehlt: {$key}");
        }
        return $value;
    }

    /** @return list<string> fehlende Pflichtwerte – der Endpoint verweigert dann den Betrieb (503). */
    public function missing(): array
    {
        $required = [
            'GOEKBAU_SECRET', 'GOEKBAU_ALLOWED_ORIGINS', 'GOEKBAU_SMTP_HOST', 'GOEKBAU_SMTP_PORT',
            'GOEKBAU_SMTP_USER', 'GOEKBAU_SMTP_PASS', 'GOEKBAU_MAIL_FROM',
            'GOEKBAU_MAIL_TO_CONTACT', 'GOEKBAU_MAIL_TO_APPLICATION',
        ];
        $missing = array_values(array_filter($required, fn (string $k) => !isset($this->values[$k])));
        if (isset($this->values['GOEKBAU_SECRET']) && strlen($this->values['GOEKBAU_SECRET']) < 32) {
            $missing[] = 'GOEKBAU_SECRET (mind. 32 Zeichen)';
        }
        return $missing;
    }

    /** @return list<string> */
    public function allowedOrigins(): array
    {
        return array_values(array_filter(array_map('trim', explode(',', $this->get('GOEKBAU_ALLOWED_ORIGINS', '')))));
    }

    public function isProduction(): bool
    {
        return $this->get('GOEKBAU_ENV', 'production') === 'production';
    }
}
