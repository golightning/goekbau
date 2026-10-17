<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests\Support;

/**
 * Erzeugt Testdateien für upload-security zur Laufzeit in einem Temp-Verzeichnis.
 * Schadmuster sind harmlose Nachbildungen (z. B. JS „app.alert“), kein echter Schadcode im Repository.
 */
final class Corpus
{
    public readonly string $dir;

    public function __construct()
    {
        $this->dir = sys_get_temp_dir() . '/goek-corpus-' . bin2hex(random_bytes(4));
        mkdir($this->dir, 0700, true);
    }

    public function cleanup(): void
    {
        foreach (glob($this->dir . '/*') ?: [] as $f) {
            @unlink($f);
        }
        @rmdir($this->dir);
    }

    public function file(string $name, string $bytes): string
    {
        $path = $this->dir . '/' . bin2hex(random_bytes(6)) . '-' . basename($name);
        file_put_contents($path, $bytes);
        return $path;
    }

    // --- PDF ------------------------------------------------------------------------------------------

    /** Minimales, gültiges PDF; $extraCatalog wird ins Katalog-Dictionary eingefügt, $objects als weitere Objekte. */
    public static function pdf(string $extraCatalog = '', string $objects = '', string $trailerExtra = ''): string
    {
        $body = "%PDF-1.7\n%\xE2\xE3\xCF\xD3\n"
            . "1 0 obj\n<< /Type /Catalog /Pages 2 0 R {$extraCatalog} >>\nendobj\n"
            . "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            . "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>\nendobj\n"
            . $objects;
        return $body . "trailer\n<< /Root 1 0 R /Size 10 {$trailerExtra} >>\nstartxref\n0\n%%EOF\n";
    }

    public static function pdfWithJavaScript(): string
    {
        return self::pdf('/OpenAction << /S /JavaScript /JS (app.alert\(1\)) >>');
    }

    /** JavaScript nur innerhalb eines komprimierten Objekt-Streams – im Klartext nicht sichtbar. */
    public static function pdfJavaScriptInObjectStream(): string
    {
        $hidden = gzcompress("4 0 << /S /JavaScript /JS (app.alert\\(1\\)) >>", 9);
        $objStm = "5 0 obj\n<< /Type /ObjStm /N 1 /First 4 /Filter /FlateDecode /Length " . strlen($hidden) . " >>\nstream\n{$hidden}\nendstream\nendobj\n";
        return self::pdf('/OpenAction 4 0 R', $objStm);
    }

    public static function pdfHexEscapedJavaScript(): string
    {
        return self::pdf('/Names << /J#61vaScript << /Names [(x) 6 0 R] >> >>');
    }

    public static function pdfLaunch(): string
    {
        return self::pdf('/OpenAction << /S /Launch /F (cmd.exe) >>');
    }

    public static function pdfEmbeddedFile(): string
    {
        return self::pdf('/Names << /EmbeddedFiles << /Names [(a.exe) 7 0 R] >> >>');
    }

    public static function pdfEncrypted(): string
    {
        return self::pdf('', '', '/Encrypt 9 0 R');
    }

    /** Harmlose OpenAction (nur Ansicht) und externe Links dürfen durch. */
    public static function pdfHarmlessOpenActionAndLink(): string
    {
        $annot = "6 0 obj\n<< /Type /Annot /Subtype /Link /A << /S /URI /URI (https://www.linkedin.com/in/x) >> >>\nendobj\n";
        return self::pdf('/OpenAction [3 0 R /Fit]', $annot);
    }

    // --- DOCX ---------------------------------------------------------------------------------------

    /** @param array<string, string> $extra zusätzliche oder überschriebene ZIP-Einträge */
    public function docx(array $extra = [], ?string $contentTypes = null): string
    {
        $path = $this->dir . '/' . bin2hex(random_bytes(6)) . '.docx';
        $zip = new \ZipArchive();
        $zip->open($path, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', $contentTypes ?? '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
        $zip->addFromString('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
        $zip->addFromString('word/document.xml', '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Lebenslauf</w:t></w:r></w:p></w:body></w:document>');
        foreach ($extra as $name => $content) {
            $zip->addFromString($name, $content);
        }
        $zip->close();
        return $path;
    }

    public static function rel(string $type, string $target, bool $external): string
    {
        return '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/' . $type . '" Target="' . $target . '"'
            . ($external ? ' TargetMode="External"' : '') . '/></Relationships>';
    }

    // --- Bilder ---------------------------------------------------------------------------------------

    public static function png(int $w = 40, int $h = 30): string
    {
        $img = imagecreatetruecolor($w, $h);
        imagefill($img, 0, 0, (int) imagecolorallocate($img, 166, 135, 92));
        ob_start();
        imagepng($img);
        return (string) ob_get_clean();
    }

    public static function jpeg(int $w = 40, int $h = 30): string
    {
        $img = imagecreatetruecolor($w, $h);
        ob_start();
        imagejpeg($img, null, 85);
        return (string) ob_get_clean();
    }

    /** JPEG mit eingefügtem APP1-Segment (EXIF mit GPS-Markierung) direkt nach SOI. */
    public static function jpegWithGps(): string
    {
        $jpeg = self::jpeg();
        $exif = "Exif\0\0" . 'MM' . "\0\x2A" . 'GPSLatitude=48.3194;GPSLongitude=10.0333;Artist=Erika Muster';
        $app1 = "\xFF\xE1" . pack('n', strlen($exif) + 2) . $exif;
        return substr($jpeg, 0, 2) . $app1 . substr($jpeg, 2);
    }
}
