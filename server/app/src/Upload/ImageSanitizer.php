<?php

declare(strict_types=1);

namespace Goekbau\Forms\Upload;

/**
 * upload-security „Entschärfung von Bildern“: dekodieren und neu kodieren. Angehängte Fremddaten,
 * EXIF/GPS und Polyglot-Anteile gehen dabei verloren. Schutz vor Dekompressions-Bomben vor dem Dekodieren.
 */
final class ImageSanitizer
{
    public const MAX_SIDE = 12000;
    public const MAX_PIXELS = 50_000_000;

    /** @return array{0: ?string, 1: ?string} [Pfad der neu kodierten Datei, Ablehnungsgrund] */
    public function sanitize(string $path, string $type, string $tmpDir): array
    {
        $info = @getimagesize($path);
        if ($info === false) {
            return [null, 'image-invalid'];
        }
        [$width, $height] = $info;
        $expected = $type === FileType::JPEG ? IMAGETYPE_JPEG : IMAGETYPE_PNG;
        if ($info[2] !== $expected) {
            return [null, 'image-invalid'];
        }
        if ($width < 1 || $height < 1 || $width > self::MAX_SIDE || $height > self::MAX_SIDE || $width * $height > self::MAX_PIXELS) {
            return [null, 'image-too-large'];
        }
        $image = @imagecreatefromstring((string) file_get_contents($path));
        if ($image === false) {
            return [null, 'image-invalid'];
        }
        $out = tempnam($tmpDir, 'img');
        if ($out === false) {
            return [null, 'image-invalid'];
        }
        $ok = $type === FileType::JPEG
            ? imagejpeg($image, $out, 90)
            : (imagesavealpha($image, true) && imagepng($image, $out, 6));
        imagedestroy($image);
        if (!$ok) {
            @unlink($out);
            return [null, 'image-invalid'];
        }
        return [$out, null];
    }
}
