<?php

declare(strict_types=1);

namespace Goekbau\Forms\Spam;

use Goekbau\Forms\Storage\FileStore;

/** spam-protection „Inhaltsfilter“: Links, BBCode/HTML, Sperrwörter, fremde Schriftsysteme, Duplikate. */
final class ContentFilter
{
    public const MAX_URLS = 2;

    /** @param list<string> $blockedWords */
    public function __construct(private readonly array $blockedWords, private readonly ?FileStore $duplicateStore = null)
    {
    }

    public static function withList(string $file, ?FileStore $store = null): self
    {
        $words = is_file($file) ? file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
        $words = array_values(array_filter(array_map(
            fn (string $w) => mb_strtolower(trim($w)),
            $words ?: [],
        ), fn (string $w) => $w !== '' && !str_starts_with($w, '#')));
        return new self($words, $store);
    }

    /** @return string|null Grund der Ablehnung (Schicht-Kennung) oder null */
    public function check(string $text): ?string
    {
        $lower = mb_strtolower($text);
        if (preg_match_all('~(?:https?://|www\.)\S+~iu', $text) > self::MAX_URLS) {
            return 'content-urls';
        }
        if (preg_match('~\[(?:url|link)[=\]]|<a\s+href~i', $text)) {
            return 'content-markup';
        }
        foreach ($this->blockedWords as $word) {
            if (preg_match('~(?<![\p{L}\p{N}])' . preg_quote($word, '~') . '(?![\p{L}\p{N}])~u', $lower)) {
                return 'content-blocklist';
            }
        }
        $letters = preg_match_all('/\p{L}/u', $text);
        $latin = preg_match_all('/\p{Latin}/u', $text);
        if ($letters >= 20 && $latin / $letters < 0.5) {
            return 'content-script';
        }
        if ($this->duplicateStore !== null && trim($text) !== '') {
            $key = 'dup:' . hash('sha256', preg_replace('/\s+/u', ' ', $lower) ?? $lower);
            $isDuplicate = $this->duplicateStore->update($key, 86400, fn ($seen) => [true, $seen === true]);
            if ($isDuplicate) {
                return 'content-duplicate';
            }
        }
        return null;
    }
}
