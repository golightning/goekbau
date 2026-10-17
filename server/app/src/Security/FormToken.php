<?php

declare(strict_types=1);

namespace Goekbau\Forms\Security;

/**
 * Signiertes Formular-Token: Formular-ID + Ausstellzeit + Zufall, HMAC-SHA256.
 * Dient als CSRF-Schutz (spam-protection „Herkunftsprüfung“) und als Zeitstempel („Signierter Zeitstempel“).
 */
final class FormToken
{
    public const MIN_SECONDS = 3;
    public const MAX_SECONDS = 7200;

    public function __construct(private readonly string $key)
    {
    }

    public function issue(string $formId, ?int $now = null): string
    {
        $payload = $formId . '.' . ($now ?? time()) . '.' . bin2hex(random_bytes(8));
        return $payload . '.' . $this->sign($payload);
    }

    /** @return array{formId: string, issuedAt: int}|null */
    public function verify(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 4 || !preg_match('/^(contact|application)$/', $parts[0]) || !ctype_digit($parts[1])) {
            return null;
        }
        $payload = "{$parts[0]}.{$parts[1]}.{$parts[2]}";
        if (!hash_equals($this->sign($payload), $parts[3])) {
            return null;
        }
        return ['formId' => $parts[0], 'issuedAt' => (int) $parts[1]];
    }

    private function sign(string $payload): string
    {
        return hash_hmac('sha256', $payload, $this->key);
    }
}
