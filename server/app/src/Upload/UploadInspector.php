<?php

declare(strict_types=1);

namespace Goekbau\Forms\Upload;

use Goekbau\Forms\Rejection;

/**
 * Upload-Pipeline (upload-security): Grenzen → Typ/Endung → Archiv/aktive Inhalte → Bild-Neukodierung →
 * Hash-Abgleich. Lehnt die gesamte Bewerbung ab, sobald eine Datei eine Prüfung nicht besteht.
 */
final class UploadInspector
{
    /** @var list<string> erzeugte Temp-Dateien – werden in cleanup() gelöscht */
    private array $created = [];

    /**
     * @param callable(string): bool $isUploadedFile in Produktion is_uploaded_file
     */
    public function __construct(
        private readonly int $maxFiles,
        private readonly int $maxTotalBytes,
        private readonly MalwareLookup $malware,
        private readonly string $tmpDir,
        private readonly mixed $isUploadedFile = 'is_uploaded_file',
        private readonly PdfScanner $pdf = new PdfScanner(),
        private readonly DocxScanner $docx = new DocxScanner(),
        private readonly ImageSanitizer $images = new ImageSanitizer(),
    ) {
    }

    /**
     * @param array<string, mixed> $filesField $_FILES['files'] (Mehrfach-Upload)
     * @return list<InspectedFile>
     */
    public function inspect(array $filesField): array
    {
        $files = self::normalize($filesField);

        // 1. Grenzen vor jeder inhaltlichen Verarbeitung
        foreach ($files as $f) {
            if (in_array($f['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
                throw $this->reject('upload-size', 'Ihre Dateien sind zusammen größer als 10 MB. Bitte verkleinern Sie sie.');
            }
            if ($f['error'] !== UPLOAD_ERR_OK) {
                throw $this->reject('upload-error', 'Eine Datei konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.');
            }
        }
        if (count($files) > $this->maxFiles) {
            throw $this->reject('upload-count', "Bitte laden Sie höchstens {$this->maxFiles} Dateien hoch.");
        }
        $total = array_sum(array_map(fn (array $f) => $f['size'], $files));
        if ($total > $this->maxTotalBytes) {
            throw $this->reject('upload-size', 'Ihre Dateien sind zusammen größer als 10 MB. Bitte verkleinern Sie sie.');
        }

        $result = [];
        foreach ($files as $index => $f) {
            $display = self::displayName($f['name']);
            $path = $f['tmp_name'];
            if (!($this->isUploadedFile)($path) || !is_file($path)) {
                throw $this->reject('upload-error', 'Eine Datei konnte nicht verarbeitet werden.');
            }
            if (FileType::isExecutable($path)) {
                throw $this->reject('upload-type', "{$display}: Erlaubt sind nur PDF, DOCX, JPG und PNG.");
            }
            $type = FileType::detect($path);
            if ($type === null || !FileType::extensionMatches($type, $f['name'])) {
                throw $this->reject('upload-type', "{$display}: Erlaubt sind nur PDF, DOCX, JPG und PNG.");
            }

            $originalHash = (string) hash_file('sha256', $path);
            $finalPath = $path;
            $reencoded = false;

            $reason = match ($type) {
                FileType::PDF => $this->pdf->scan($path),
                FileType::DOCX => $this->docx->scan($path),
                default => null,
            };
            if ($type === FileType::JPEG || $type === FileType::PNG) {
                [$clean, $reason] = $this->images->sanitize($path, $type, $this->tmpDir);
                if ($clean !== null) {
                    $this->created[] = $clean;
                    $finalPath = $clean;
                    $reencoded = true;
                }
            }
            if ($reason !== null) {
                throw $this->reject('upload-' . $reason, $display . ': ' . self::explain($reason));
            }

            $check = $this->malware->lookup($originalHash);
            if ($check === MalwareLookup::MALICIOUS) {
                throw $this->reject('upload-malware', "{$display}: Diese Datei wurde als Schadsoftware erkannt und nicht angenommen.");
            }

            $result[] = new InspectedFile(
                path: $finalPath,
                type: $type,
                attachmentName: sprintf('bewerbung-%d.%s', $index + 1, FileType::canonicalExtension($type)),
                size: (int) filesize($finalPath),
                sha256: (string) hash_file('sha256', $finalPath),
                malwareCheck: $check,
                reencoded: $reencoded,
            );
        }
        return $result;
    }

    /** form-submissions „Datensparsamkeit“: alle erzeugten und hochgeladenen Dateien entfernen. */
    public function cleanup(array $filesField = []): void
    {
        foreach ($this->created as $file) {
            @unlink($file);
        }
        $this->created = [];
        foreach (self::normalize($filesField) as $f) {
            if ($f['tmp_name'] !== '' && is_file($f['tmp_name'])) {
                @unlink($f['tmp_name']);
            }
        }
    }

    /**
     * @param array<string, mixed> $field
     * @return list<array{name: string, tmp_name: string, size: int, error: int}>
     */
    public static function normalize(array $field): array
    {
        if (!isset($field['name'])) {
            return [];
        }
        $names = (array) $field['name'];
        $out = [];
        foreach (array_keys($names) as $i) {
            $error = (int) ((array) ($field['error'] ?? []))[$i];
            if ($error === UPLOAD_ERR_NO_FILE) {
                continue;
            }
            $out[] = [
                'name' => (string) $names[$i],
                'tmp_name' => (string) (((array) ($field['tmp_name'] ?? []))[$i] ?? ''),
                'size' => (int) (((array) ($field['size'] ?? []))[$i] ?? 0),
                'error' => $error,
            ];
        }
        return $out;
    }

    /** Dateiname nur zur Anzeige im Fehlertext: ohne Pfad, Steuer- und Richtungszeichen, gekürzt. */
    public static function displayName(string $name): string
    {
        $base = basename(str_replace('\\', '/', $name));
        $clean = (string) preg_replace('/[\p{Cc}\p{Cf}]/u', '', $base);
        return mb_substr($clean !== '' ? $clean : 'Datei', 0, 80);
    }

    private static function explain(string $reason): string
    {
        return match (true) {
            $reason === 'pdf-active' => 'Das PDF enthält aktive Inhalte (z. B. JavaScript oder eingebettete Dateien). Bitte exportieren Sie es erneut als einfaches PDF („Drucken als PDF“).',
            $reason === 'pdf-encrypted' => 'Das PDF ist verschlüsselt oder passwortgeschützt. Bitte senden Sie eine ungeschützte Fassung.',
            str_starts_with($reason, 'pdf-') => 'Das PDF ist beschädigt oder ungewöhnlich aufgebaut. Bitte exportieren Sie es erneut als einfaches PDF („Drucken als PDF“).',
            $reason === 'docx-macro' || $reason === 'docx-active' => 'Das Word-Dokument enthält Makros oder eingebettete Objekte. Bitte speichern Sie es als PDF.',
            $reason === 'docx-external' => 'Das Word-Dokument lädt externe Inhalte nach. Bitte speichern Sie es als PDF.',
            str_starts_with($reason, 'docx-') => 'Das Word-Dokument ist beschädigt oder ungewöhnlich aufgebaut. Bitte speichern Sie es als PDF.',
            $reason === 'image-too-large' => 'Das Bild ist zu groß. Bitte verkleinern Sie es.',
            default => 'Die Datei ist beschädigt oder kein gültiges Bild.',
        };
    }

    private function reject(string $layer, string $message): Rejection
    {
        return new Rejection(422, $layer, $message, ['files' => $message]);
    }
}
