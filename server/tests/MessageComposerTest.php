<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests;

use Goekbau\Forms\Mail\MessageComposer;
use Goekbau\Forms\Upload\InspectedFile;
use Goekbau\Forms\Upload\MalwareLookup;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/** email-security: Header-Injection, reiner Text, Betreff. */
final class MessageComposerTest extends TestCase
{
    /** @return iterable<string, array{string}> */
    public static function injections(): iterable
    {
        yield 'CRLF' => ["Max\r\nBcc: opfer@example.com"];
        yield 'nur LF' => ["Max\nBcc: opfer@example.com"];
        yield 'nur CR' => ["Max\rBcc: opfer@example.com"];
        yield 'Unicode-Zeilentrenner' => ["Max\u{2028}Bcc: opfer@example.com"];
        yield 'Nullbyte' => ["Max\0Bcc: opfer@example.com"];
        yield 'NEL' => ["Max\u{0085}Bcc: opfer@example.com"];
    }

    #[DataProvider('injections')]
    public function testHeaderWerteEnthaltenKeineZeilenumbrueche(string $name): void
    {
        $msg = (new MessageComposer())->contact(['name' => $name, 'email' => 'max@example.org', 'phone' => '', 'message' => 'Hallo Welt, Nachricht'], 'info@goekbau.de');
        self::assertDoesNotMatchRegularExpression('/[\r\n\x00\x{0085}\x{2028}\x{2029}]/u', $msg->subject);
        self::assertDoesNotMatchRegularExpression('/[\r\n\x00\x{0085}\x{2028}\x{2029}]/u', $msg->replyToName);
    }

    public function testBetreffWirdBegrenzt(): void
    {
        $msg = (new MessageComposer())->contact(['name' => str_repeat('A', 500), 'email' => 'a@b.de', 'message' => 'x'], 'info@goekbau.de');
        self::assertLessThanOrEqual(MessageComposer::SUBJECT_MAX, mb_strlen($msg->subject));
    }

    public function testHtmlBleibtWoertlicherText(): void
    {
        $html = '<a href="https://phish.example">Rechnung</a>';
        $msg = (new MessageComposer())->contact(['name' => 'Max', 'email' => 'a@b.de', 'message' => $html], 'info@goekbau.de');
        self::assertStringContainsString($html, $msg->body);
    }

    public function testBewerbungNenntPositionImBetreffUndUngepruefteAnhaenge(): void
    {
        $file = new InspectedFile('/tmp/x', 'pdf', 'bewerbung-1.pdf', 1234, str_repeat('a', 64), MalwareLookup::UNKNOWN, false);
        $msg = (new MessageComposer())->application(['name' => 'Erika', 'email' => 'e@b.de', 'position' => 'Fachbauüberwacher Oberbau', 'message' => ''], [$file], 'deniz.goek@goekbau.de');
        self::assertStringStartsWith('[Anhang ungeprüft] Bewerbung: Fachbauüberwacher Oberbau', $msg->subject);
        self::assertStringContainsString('SHA-256: ' . str_repeat('a', 64), $msg->body);
        self::assertSame('e@b.de', $msg->replyTo);
    }
}
