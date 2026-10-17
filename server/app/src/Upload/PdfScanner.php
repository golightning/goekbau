<?php

declare(strict_types=1);

namespace Goekbau\Forms\Upload;

/**
 * upload-security „Prüfung von PDFs auf aktive Inhalte“. Dekomprimiert alle FlateDecode-Streams
 * (inkl. Objekt-Streams) begrenzt, normalisiert #xx-Escapes in Namen und sucht riskante Schlüssel.
 * Fail-closed: Was nicht sauber lesbar ist, wird abgelehnt.
 */
final class PdfScanner
{
    private const MAX_INFLATED_TOTAL = 64 * 1024 * 1024;
    private const MAX_STREAMS = 5000;

    /** Riskante Namen; (?![A-Za-z]) verhindert Treffer in längeren Namen wie /JSON */
    private const RISKY = '~/(JavaScript|JS|Launch|EmbeddedFiles?|RichMedia|XFA|ImportData|SubmitForm|GoToE)(?![A-Za-z])~';
    private const OPEN_ACTION = '~/OpenAction\s*<<(?:(?!>>).){0,500}?/S\s*/(?!GoTo(?![A-Za-z]))[A-Za-z]+~s';

    /** @return string|null Ablehnungsgrund oder null */
    public function scan(string $path): ?string
    {
        $bytes = (string) file_get_contents($path);
        if (!str_starts_with($bytes, '%PDF-') || !str_contains(substr($bytes, -2048), '%%EOF')) {
            return 'pdf-invalid';
        }

        $haystacks = [$bytes];
        $inflatedTotal = 0;
        $offset = 0;
        $streams = 0;
        while (($pos = strpos($bytes, 'stream', $offset)) !== false) {
            $offset = $pos + 6;
            // nur echte Stream-Anfänge: "stream" gefolgt von CRLF oder LF, nicht "endstream"
            if ($pos >= 3 && substr($bytes, $pos - 3, 3) === 'end') {
                continue;
            }
            $dataStart = $pos + 6;
            if (substr($bytes, $dataStart, 2) === "\r\n") {
                $dataStart += 2;
            } elseif (($bytes[$dataStart] ?? '') === "\n" || ($bytes[$dataStart] ?? '') === "\r") {
                $dataStart += 1;
            } else {
                continue;
            }
            $end = strpos($bytes, 'endstream', $dataStart);
            if ($end === false) {
                return 'pdf-invalid';
            }
            if (++$streams > self::MAX_STREAMS) {
                return 'pdf-invalid';
            }
            $dict = substr($bytes, max(0, $pos - 1500), min(1500, $pos));
            $dict = substr($dict, (int) strrpos($dict, '<<'));
            $offset = $end + 9;
            if (!preg_match('~/(FlateDecode|Fl)(?![A-Za-z])~', $dict)) {
                continue;
            }
            $data = substr($bytes, $dataStart, $end - $dataStart);
            $inflated = $this->inflate($data, self::MAX_INFLATED_TOTAL - $inflatedTotal);
            if ($inflated === null) {
                return 'pdf-invalid';
            }
            $inflatedTotal += strlen($inflated);
            if ($inflatedTotal >= self::MAX_INFLATED_TOTAL) {
                return 'pdf-too-complex';
            }
            $haystacks[] = $inflated;
        }

        foreach ($haystacks as $haystack) {
            $normalized = $this->normalizeNames($haystack);
            if (preg_match('~/Encrypt(?![A-Za-z])~', $normalized)) {
                return 'pdf-encrypted';
            }
            if (preg_match(self::RISKY, $normalized) || preg_match(self::OPEN_ACTION, $normalized)) {
                return 'pdf-active';
            }
        }
        return null;
    }

    private function inflate(string $data, int $limit): ?string
    {
        $context = @inflate_init(ZLIB_ENCODING_DEFLATE);
        if ($context === false) {
            return null;
        }
        $out = '';
        foreach (str_split($data, 65536) ?: [''] as $chunk) {
            $part = @inflate_add($context, $chunk, ZLIB_SYNC_FLUSH);
            if ($part === false) {
                // tolerant gegenüber angehängten Füllbytes nach dem Stream-Ende
                return inflate_get_status($context) === ZLIB_STREAM_END ? $out : ($out !== '' ? $out : null);
            }
            $out .= $part;
            if (strlen($out) > $limit) {
                return $out;
            }
            if (inflate_get_status($context) === ZLIB_STREAM_END) {
                break;
            }
        }
        return $out;
    }

    /** "/J#61vaScript" → "/JavaScript" (PDF-Namen dürfen Zeichen hex-kodieren) */
    private function normalizeNames(string $s): string
    {
        return (string) preg_replace_callback(
            '~/[^\s/<>\[\]()%{}]*#[0-9A-Fa-f]{2}[^\s/<>\[\]()%{}]*~',
            fn (array $m) => (string) preg_replace_callback('~#([0-9A-Fa-f]{2})~', fn (array $h) => chr((int) hexdec($h[1])), $m[0]),
            $s,
        );
    }
}
