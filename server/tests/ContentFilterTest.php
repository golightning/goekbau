<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests;

use Goekbau\Forms\Spam\ContentFilter;
use Goekbau\Forms\Storage\FileStore;
use PHPUnit\Framework\TestCase;

/** spam-protection „Inhaltsfilter“ (Task 8.2): echter, anonymisierter Spam-Korpus und legitime Anfragen. */
final class ContentFilterTest extends TestCase
{
    private static function filter(?FileStore $store = null): ContentFilter
    {
        return ContentFilter::withList(dirname(__DIR__) . '/app/data/blocked-words.txt', $store);
    }

    /** @return list<string> */
    private static function corpus(string $name): array
    {
        return json_decode((string) file_get_contents(__DIR__ . "/fixtures/{$name}.json"), true)['messages'];
    }

    public function testKeinFehlalarmBeiLegitimenAnfragen(): void
    {
        $ham = self::corpus('ham-corpus');
        self::assertGreaterThanOrEqual(10, count($ham));
        foreach ($ham as $message) {
            self::assertNull(self::filter()->check($message), $message);
        }
    }

    public function testMindestensAchtzigProzentDesEchtenSpamsWerdenErkannt(): void
    {
        $spam = self::corpus('spam-corpus');
        self::assertGreaterThanOrEqual(30, count($spam));
        $caught = count(array_filter($spam, fn (string $m) => self::filter()->check($m) !== null));
        self::assertGreaterThanOrEqual(0.75, $caught / count($spam), "erkannt: {$caught}/" . count($spam));
    }

    public function testEinzelregeln(): void
    {
        $f = self::filter();
        self::assertSame('content-urls', $f->check('https://a.example https://b.example https://c.example'));
        self::assertNull($f->check('Projektinfos: https://a.example und https://b.example'));
        self::assertSame('content-markup', $f->check('[url=https://x.example]Angebot[/url]'));
        self::assertSame('content-markup', $f->check('<a href="https://x.example">Rechnung</a>'));
        self::assertSame('content-blocklist', $f->check('Click here to unsubscribe'));
        self::assertSame('content-script', $f->check('Кузовные детали на Форд Фокус купить в Москве недорого'));
        self::assertNull($f->check('Gleisbau in Seoul? Nein, in Ulm.'), 'Sperrwort „seo“ nur als ganzes Wort');
    }

    public function testIdentischeNachrichtInnerhalbVon24StundenIstDuplikat(): void
    {
        $dir = sys_get_temp_dir() . '/goek-dup-' . bin2hex(random_bytes(4));
        $f = self::filter(new FileStore($dir));
        self::assertNull($f->check('Wir brauchen einen Sicherungsüberwacher in Ulm.'));
        self::assertSame('content-duplicate', $f->check("Wir brauchen  einen Sicherungsüberwacher\nin Ulm."));
        exec('rm -rf ' . escapeshellarg($dir));
    }
}
