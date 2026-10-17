<?php

declare(strict_types=1);

namespace Goekbau\Forms\Upload;

/** upload-security „Erlaubte Dateitypen“: Erkennung über Magic Bytes und Struktur, nicht über die Endung. */
final class FileType
{
    public const PDF = 'pdf';
    public const DOCX = 'docx';
    public const JPEG = 'jpeg';
    public const PNG = 'png';

    /** Erlaubte Endungen je erkanntem Typ */
    private const EXTENSIONS = [
        self::PDF => ['pdf'],
        self::DOCX => ['docx'],
        self::JPEG => ['jpg', 'jpeg'],
        self::PNG => ['png'],
    ];

    /** finfo-Typen, die unabhängig von allem anderen sofort zur Ablehnung führen */
    private const EXECUTABLE_MIME = [
        'application/x-dosexec', 'application/x-msdownload', 'application/x-executable',
        'application/x-mach-binary', 'application/x-sharedlib', 'application/x-elf',
        'application/x-sh', 'application/x-shellscript', 'text/x-shellscript', 'application/javascript',
        'text/javascript', 'application/x-msi', 'application/vnd.microsoft.portable-executable',
    ];

    public static function detect(string $path): ?string
    {
        $head = (string) file_get_contents($path, false, null, 0, 1024);
        if (str_starts_with($head, "\xFF\xD8\xFF")) {
            return self::JPEG;
        }
        if (str_starts_with($head, "\x89PNG\r\n\x1A\n")) {
            return self::PNG;
        }
        if (str_starts_with($head, '%PDF-')) {
            return self::PDF;
        }
        if (str_starts_with($head, "PK\x03\x04")) {
            $zip = new \ZipArchive();
            if ($zip->open($path, \ZipArchive::RDONLY) === true) {
                $isDocx = $zip->locateName('word/document.xml') !== false
                    && $zip->locateName('[Content_Types].xml') !== false;
                $zip->close();
                return $isDocx ? self::DOCX : null;
            }
        }
        return null;
    }

    public static function extensionMatches(string $type, string $filename): bool
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        return in_array($ext, self::EXTENSIONS[$type] ?? [], true);
    }

    public static function isExecutable(string $path): bool
    {
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($path) ?: '';
        $head = (string) file_get_contents($path, false, null, 0, 4);
        return in_array($mime, self::EXECUTABLE_MIME, true)
            || str_starts_with($head, 'MZ')
            || str_starts_with($head, "\x7FELF")
            || str_starts_with($head, '#!');
    }

    public static function canonicalExtension(string $type): string
    {
        return $type === self::JPEG ? 'jpg' : $type;
    }

    public static function mime(string $type): string
    {
        return match ($type) {
            self::PDF => 'application/pdf',
            self::DOCX => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            self::JPEG => 'image/jpeg',
            self::PNG => 'image/png',
        };
    }
}
