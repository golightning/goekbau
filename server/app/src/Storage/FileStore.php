<?php

declare(strict_types=1);

namespace Goekbau\Forms\Storage;

/**
 * Kleiner Schlüssel-Wert-Speicher auf Dateibasis mit Ablaufzeit und exklusiver Sperre.
 * Liegt außerhalb des Document Roots; Schlüssel werden gehasht als Dateinamen verwendet.
 */
final class FileStore
{
    public function __construct(private readonly string $dir)
    {
        if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
            throw new \RuntimeException('Speicherverzeichnis nicht anlegbar');
        }
    }

    /**
     * Liest, verändert und schreibt einen Eintrag atomar.
     * @template T
     * @param callable(mixed): array{0: mixed, 1: T} $fn erhält den alten Wert (oder null), liefert [neuer Wert, Rückgabe]
     * @return T
     */
    public function update(string $key, int $ttlSeconds, callable $fn): mixed
    {
        $file = $this->path($key);
        $handle = fopen($file, 'c+');
        if ($handle === false) {
            throw new \RuntimeException('Speicher nicht beschreibbar');
        }
        try {
            flock($handle, LOCK_EX);
            $raw = stream_get_contents($handle);
            $current = null;
            if (is_string($raw) && $raw !== '') {
                $decoded = json_decode($raw, true);
                if (is_array($decoded) && ($decoded['expires'] ?? 0) >= time()) {
                    $current = $decoded['value'] ?? null;
                }
            }
            [$next, $result] = $fn($current);
            ftruncate($handle, 0);
            rewind($handle);
            fwrite($handle, json_encode(['expires' => time() + $ttlSeconds, 'value' => $next], JSON_THROW_ON_ERROR));
            fflush($handle);
            flock($handle, LOCK_UN);
            return $result;
        } finally {
            fclose($handle);
        }
    }

    /** Entfernt abgelaufene Einträge (gelegentlich aufgerufen). */
    public function prune(): void
    {
        foreach (glob($this->dir . '/*.json') ?: [] as $file) {
            $data = json_decode((string) @file_get_contents($file), true);
            if (!is_array($data) || ($data['expires'] ?? 0) < time()) {
                @unlink($file);
            }
        }
    }

    private function path(string $key): string
    {
        return $this->dir . '/' . hash('sha256', $key) . '.json';
    }
}
