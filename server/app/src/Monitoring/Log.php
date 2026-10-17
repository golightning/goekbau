<?php

declare(strict_types=1);

namespace Goekbau\Forms\Monitoring;

/**
 * web-security „Datenschutzfreundliches Logging“: nur Zeit, Formular, Ergebnis-Code, Schicht und gekürzter
 * IP-Hash. Keine Namen, E-Mail-Adressen, Inhalte oder Dateinamen. Rotation nach 14 Tagen.
 */
final class Log
{
    private const RETENTION_DAYS = 14;

    public function __construct(private readonly string $dir)
    {
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
    }

    public function write(string $form, int $status, string $layer, string $ipHash): void
    {
        $line = sprintf(
            "%s\t%s\t%d\t%s\t%s\n",
            gmdate('Y-m-d\TH:i:s\Z'),
            preg_replace('/[^a-z]/', '', $form) ?: '-',
            $status,
            preg_replace('/[^a-z0-9_-]/', '', $layer) ?: '-',
            substr($ipHash, 0, 12),
        );
        @file_put_contents($this->dir . '/' . gmdate('Y-m-d') . '.log', $line, FILE_APPEND | LOCK_EX);
        if (random_int(1, 50) === 1) {
            $this->rotate();
        }
    }

    public function rotate(): void
    {
        $cutoff = time() - self::RETENTION_DAYS * 86400;
        foreach (glob($this->dir . '/*.log') ?: [] as $file) {
            if (filemtime($file) < $cutoff) {
                @unlink($file);
            }
        }
    }
}
