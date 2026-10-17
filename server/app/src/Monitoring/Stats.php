<?php

declare(strict_types=1);

namespace Goekbau\Forms\Monitoring;

use Goekbau\Forms\Storage\FileStore;

/** spam-protection „Spam-Monitoring“: Tageszähler je Ergebnis/Schicht, ohne personenbezogene Daten. */
final class Stats
{
    public function __construct(private readonly FileStore $store)
    {
    }

    public function count(string $outcome, ?string $day = null): void
    {
        $day ??= gmdate('Y-m-d');
        $outcome = preg_replace('/[^a-z0-9_-]/', '', $outcome) ?: 'unknown';
        $this->store->update("stats:{$day}", 40 * 86400, function ($current) use ($outcome) {
            $counts = is_array($current) ? $current : [];
            $counts[$outcome] = (int) ($counts[$outcome] ?? 0) + 1;
            return [$counts, null];
        });
    }

    /** @return array<string, int> */
    public function forDay(string $day): array
    {
        return $this->store->update("stats:{$day}", 40 * 86400, fn ($current) => [$current, is_array($current) ? $current : []]);
    }
}
