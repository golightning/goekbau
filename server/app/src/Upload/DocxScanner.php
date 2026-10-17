<?php

declare(strict_types=1);

namespace Goekbau\Forms\Upload;

/**
 * upload-security „Schutz vor Archiv-Bomben“ und „Prüfung von DOCX auf aktive Inhalte“.
 * Alle Prüfungen laufen über die ZIP-Statistik bzw. kleine XML-Teile – es wird nichts auf die Platte entpackt.
 */
final class DocxScanner
{
    public const MAX_ENTRIES = 1000;
    public const MAX_UNCOMPRESSED = 50 * 1024 * 1024;
    public const MAX_RATIO = 100;
    private const MAX_RELS_BYTES = 1024 * 1024;

    /** @return string|null Ablehnungsgrund oder null */
    public function scan(string $path): ?string
    {
        $zip = new \ZipArchive();
        if ($zip->open($path, \ZipArchive::RDONLY) !== true) {
            return 'docx-invalid';
        }
        try {
            if ($zip->numFiles > self::MAX_ENTRIES) {
                return 'docx-zipbomb';
            }
            $uncompressed = 0;
            $compressed = 0;
            $relsFiles = [];
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $stat = $zip->statIndex($i);
                if ($stat === false) {
                    return 'docx-invalid';
                }
                $name = $stat['name'];
                if (str_contains($name, '..') || str_starts_with($name, '/') || str_contains($name, '\\') || preg_match('/[\x00-\x1F]/', $name)) {
                    return 'docx-path';
                }
                $uncompressed += $stat['size'];
                $compressed += $stat['comp_size'];
                if ($uncompressed > self::MAX_UNCOMPRESSED) {
                    return 'docx-zipbomb';
                }
                $lower = strtolower($name);
                if (str_ends_with($lower, 'vbaproject.bin') || str_contains($lower, 'vbadata')) {
                    return 'docx-macro';
                }
                if (str_contains($lower, '/activex/') || str_contains($lower, '/embeddings/') || str_contains($lower, 'oleobject')) {
                    return 'docx-active';
                }
                if (str_ends_with($lower, '.rels')) {
                    $relsFiles[] = $name;
                }
            }
            if ($compressed > 0 && $uncompressed / $compressed > self::MAX_RATIO) {
                return 'docx-zipbomb';
            }

            $types = (string) $zip->getFromName('[Content_Types].xml', self::MAX_RELS_BYTES);
            if (stripos($types, 'macroEnabled') !== false || stripos($types, 'vbaProject') !== false) {
                return 'docx-macro';
            }

            foreach ($relsFiles as $relsName) {
                $rels = (string) $zip->getFromName($relsName, self::MAX_RELS_BYTES);
                if (!preg_match_all('~<Relationship\b[^>]*>~i', $rels, $matches)) {
                    continue;
                }
                foreach ($matches[0] as $rel) {
                    $type = preg_match('~Type="([^"]*)"~i', $rel, $t) ? strtolower($t[1]) : '';
                    if (str_contains($type, 'afchunk') || str_contains($type, 'oleobject') || str_contains($type, 'vbaproject')) {
                        return 'docx-active';
                    }
                    // Externe Ziele nur für normale Hyperlinks (Remote-Template-Injection, Tracking-Bilder, Frames)
                    if (preg_match('~TargetMode="External"~i', $rel) && !str_ends_with($type, '/hyperlink')) {
                        return 'docx-external';
                    }
                }
            }
            return null;
        } finally {
            $zip->close();
        }
    }
}
