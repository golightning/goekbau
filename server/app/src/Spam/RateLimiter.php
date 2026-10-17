<?php

declare(strict_types=1);

namespace Goekbau\Forms\Spam;

use Goekbau\Forms\Storage\FileStore;

/**
 * spam-protection „Rate-Limit“: Sliding Window. Schlüssel sind gesalzene Hashes (IP bzw. E-Mail);
 * gespeichert werden nur Zeitstempel, höchstens 24 Stunden.
 */
final class RateLimiter
{
    public function __construct(private readonly FileStore $store, private readonly string $salt)
    {
    }

    public function hash(string $value): string
    {
        return hash_hmac('sha256', strtolower(trim($value)), $this->salt);
    }

    /**
     * Zählt einen Versuch und liefert bei Überschreitung die Wartezeit in Sekunden, sonst null.
     * @param list<array{int, int}> $windows Liste aus [Fenster in Sekunden, maximale Anzahl]
     */
    public function hit(string $bucket, string $hashedKey, array $windows, ?int $now = null): ?int
    {
        $now ??= time();
        $maxWindow = max(array_map(fn (array $w) => $w[0], $windows));
        return $this->store->update("rate:{$bucket}:{$hashedKey}", 86400, function ($current) use ($now, $maxWindow, $windows) {
            $stamps = array_values(array_filter(
                is_array($current) ? $current : [],
                fn ($t) => is_int($t) && $t > $now - $maxWindow,
            ));
            foreach ($windows as [$seconds, $limit]) {
                $inWindow = array_values(array_filter($stamps, fn (int $t) => $t > $now - $seconds));
                if (count($inWindow) >= $limit) {
                    $retry = max(1, min($inWindow) + $seconds - $now);
                    return [$stamps, $retry];
                }
            }
            $stamps[] = $now;
            return [$stamps, null];
        });
    }
}
