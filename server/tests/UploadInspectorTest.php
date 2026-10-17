<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests;

use Goekbau\Forms\Rejection;
use Goekbau\Forms\Tests\Support\Corpus;
use Goekbau\Forms\Tests\Support\FakeMalwareLookup;
use Goekbau\Forms\Upload\MalwareLookup;
use Goekbau\Forms\Upload\UploadInspector;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/** upload-security: Testkorpus (Tasks 8.3–8.5). */
final class UploadInspectorTest extends TestCase
{
    private Corpus $corpus;

    protected function setUp(): void
    {
        $this->corpus = new Corpus();
    }

    protected function tearDown(): void
    {
        $this->corpus->cleanup();
    }

    private function inspector(?MalwareLookup $malware = null): UploadInspector
    {
        return new UploadInspector(5, 10 * 1024 * 1024, $malware ?? new FakeMalwareLookup(), $this->corpus->dir, fn () => true);
    }

    /** @param list<array{string, string}> $files [Dateiname, Pfad] */
    private static function field(array $files, int $error = UPLOAD_ERR_OK): array
    {
        return [
            'name' => array_map(fn ($f) => $f[0], $files),
            'tmp_name' => array_map(fn ($f) => $f[1], $files),
            'size' => array_map(fn ($f) => (int) filesize($f[1]), $files),
            'error' => array_map(fn () => $error, $files),
        ];
    }

    private function expectReject(string $layerPrefix, array $field): Rejection
    {
        try {
            $this->inspector()->inspect($field);
        } catch (Rejection $r) {
            self::assertStringStartsWith($layerPrefix, $r->layer);
            self::assertSame(422, $r->status);
            self::assertArrayHasKey('files', $r->fieldErrors);
            return $r;
        }
        self::fail("erwartete Ablehnung {$layerPrefix}");
    }

    /** @return iterable<string, array{string, callable(Corpus): string, string}> */
    public static function malicious(): iterable
    {
        yield 'EXE als PDF getarnt' => ['lebenslauf.pdf', fn (Corpus $c) => $c->file('x', "MZ\x90\x00" . str_repeat("\0", 200)), 'upload-type'];
        yield 'ELF-Binary' => ['cv.pdf', fn (Corpus $c) => $c->file('x', "\x7FELF" . str_repeat("\0", 64)), 'upload-type'];
        yield 'Shell-Skript' => ['cv.pdf', fn (Corpus $c) => $c->file('x', "#!/bin/sh\nrm -rf /\n"), 'upload-type'];
        yield 'EICAR-Testsignatur' => ['cv.pdf', fn (Corpus $c) => $c->file('x', 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'), 'upload-type'];
        yield 'Legacy-DOC (OLE)' => ['cv.doc', fn (Corpus $c) => $c->file('x', "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1" . str_repeat("\0", 500)), 'upload-type'];
        yield 'RTF' => ['cv.rtf', fn (Corpus $c) => $c->file('x', '{\rtf1\ansi Lebenslauf}'), 'upload-type'];
        yield 'ZIP-Archiv' => ['unterlagen.zip', fn (Corpus $c) => $c->docx(), 'upload-type'];
        yield 'ZIP ohne Word-Struktur als DOCX' => ['cv.docx', function (Corpus $c) {
            $p = $c->dir . '/plain.zip';
            $z = new \ZipArchive();
            $z->open($p, \ZipArchive::CREATE);
            $z->addFromString('a.txt', 'x');
            $z->close();
            return $p;
        }, 'upload-type'];
        yield 'PDF mit Endung .docx' => ['cv.docx', fn (Corpus $c) => $c->file('x', Corpus::pdf()), 'upload-type'];
        yield 'PDF mit JavaScript' => ['cv.pdf', fn (Corpus $c) => $c->file('x', Corpus::pdfWithJavaScript()), 'upload-pdf-active'];
        yield 'PDF mit JavaScript im Objekt-Stream' => ['cv.pdf', fn (Corpus $c) => $c->file('x', Corpus::pdfJavaScriptInObjectStream()), 'upload-pdf-active'];
        yield 'PDF mit hex-kodiertem /JavaScript' => ['cv.pdf', fn (Corpus $c) => $c->file('x', Corpus::pdfHexEscapedJavaScript()), 'upload-pdf-active'];
        yield 'PDF mit /Launch' => ['cv.pdf', fn (Corpus $c) => $c->file('x', Corpus::pdfLaunch()), 'upload-pdf-active'];
        yield 'PDF mit eingebetteter Datei' => ['cv.pdf', fn (Corpus $c) => $c->file('x', Corpus::pdfEmbeddedFile()), 'upload-pdf-active'];
        yield 'verschlüsseltes PDF' => ['cv.pdf', fn (Corpus $c) => $c->file('x', Corpus::pdfEncrypted()), 'upload-pdf-encrypted'];
        yield 'abgeschnittenes PDF' => ['cv.pdf', fn (Corpus $c) => $c->file('x', substr(Corpus::pdf(), 0, 120)), 'upload-pdf-invalid'];
        yield 'DOCX mit Makro' => ['cv.docx', fn (Corpus $c) => $c->docx(['word/vbaProject.bin' => 'VBA']), 'upload-docx-macro'];
        yield 'DOCM-Content-Type' => ['cv.docx', fn (Corpus $c) => $c->docx([], '<Types><Override ContentType="application/vnd.ms-word.document.macroEnabled.main+xml"/></Types>'), 'upload-docx-macro'];
        yield 'DOCX mit OLE-Objekt' => ['cv.docx', fn (Corpus $c) => $c->docx(['word/embeddings/oleObject1.bin' => 'OLE']), 'upload-docx-active'];
        yield 'DOCX mit ActiveX' => ['cv.docx', fn (Corpus $c) => $c->docx(['word/activeX/activeX1.xml' => '<ax/>']), 'upload-docx-active'];
        yield 'DOCX mit Remote-Template' => ['cv.docx', fn (Corpus $c) => $c->docx(['word/_rels/settings.xml.rels' => Corpus::rel('attachedTemplate', 'https://evil.example/t.dotm', true)]), 'upload-docx-external'];
        yield 'DOCX mit externem Bild' => ['cv.docx', fn (Corpus $c) => $c->docx(['word/_rels/document.xml.rels' => Corpus::rel('image', 'http://tracker.example/p.png', true)]), 'upload-docx-external'];
        yield 'DOCX mit altChunk' => ['cv.docx', fn (Corpus $c) => $c->docx(['word/_rels/document.xml.rels' => Corpus::rel('aFChunk', 'chunk.mht', false)]), 'upload-docx-active'];
        yield 'DOCX-Zip-Bombe' => ['cv.docx', fn (Corpus $c) => $c->docx(['word/media/bomb.bin' => str_repeat("\0", 8 * 1024 * 1024)]), 'upload-docx-zipbomb'];
        yield 'DOCX mit Path-Traversal' => ['cv.docx', fn (Corpus $c) => $c->docx(['../../evil.php' => '<?php']), 'upload-docx-path'];
        yield 'kaputtes PNG' => ['foto.png', fn (Corpus $c) => $c->file('x', "\x89PNG\r\n\x1A\n" . 'kein bild'), 'upload-image-invalid'];
    }

    /** @param callable(Corpus): string $make */
    #[DataProvider('malicious')]
    public function testSchaedlicheOderUnzulaessigeDateienWerdenAbgelehnt(string $name, callable $make, string $layer): void
    {
        $this->expectReject($layer, self::field([[$name, $make($this->corpus)]]));
    }

    public function testPdfFehlermeldungNenntDateiUndAusweg(): void
    {
        $r = $this->expectReject('upload-pdf-active', self::field([['Mein Lebenslauf.pdf', $this->corpus->file('x', Corpus::pdfWithJavaScript())]]));
        self::assertStringContainsString('Mein Lebenslauf.pdf', $r->userMessage);
        self::assertStringContainsString('Drucken als PDF', $r->userMessage);
    }

    public function testGrenzenGreifenVorJederInhaltsverarbeitung(): void
    {
        $malware = new FakeMalwareLookup();
        $files = array_map(fn ($i) => ["{$i}.pdf", $this->corpus->file('x', Corpus::pdf())], range(1, 6));
        try {
            $this->inspector($malware)->inspect(self::field($files));
            self::fail('erwartet: zu viele Dateien');
        } catch (Rejection $r) {
            self::assertSame('upload-count', $r->layer);
        }
        self::assertSame(0, $malware->calls, 'keine Datei darf inhaltlich verarbeitet worden sein');

        $big = $this->corpus->file('big.pdf', Corpus::pdf() . str_repeat(' ', 11 * 1024 * 1024));
        $this->expectReject('upload-size', self::field([['big.pdf', $big]]));
        $this->expectReject('upload-size', self::field([['a.pdf', $big]], UPLOAD_ERR_INI_SIZE));
    }

    public function testBekannteMalwareWirdAbgelehnt(): void
    {
        $path = $this->corpus->file('x', Corpus::pdf());
        $inspector = $this->inspector(new FakeMalwareLookup([(string) hash_file('sha256', $path) => MalwareLookup::MALICIOUS]));
        $this->expectException(Rejection::class);
        $this->expectExceptionMessageMatches('/upload-malware/');
        $inspector->inspect(self::field([['cv.pdf', $path]]));
    }

    public function testDatenbankNichtErreichbarFuehrtZuUngeprueftAberAngenommen(): void
    {
        $path = $this->corpus->file('x', Corpus::pdf());
        $result = $this->inspector(new FakeMalwareLookup([], MalwareLookup::UNKNOWN))->inspect(self::field([['cv.pdf', $path]]));
        self::assertSame(MalwareLookup::UNKNOWN, $result[0]->malwareCheck);
    }

    public function testPolyglotPngWirdNeuKodiertUndVerliertAngehaengteDaten(): void
    {
        $payload = '<?php system($_GET[0]); ?>PK' . "\x03\x04" . 'versteckt';
        $path = $this->corpus->file('x', Corpus::png() . $payload);
        $result = $this->inspector()->inspect(self::field([['foto.png', $path]]));
        self::assertTrue($result[0]->reencoded);
        $out = (string) file_get_contents($result[0]->path);
        self::assertStringNotContainsString('system(', $out);
        self::assertStringNotContainsString('versteckt', $out);
        self::assertNotFalse(imagecreatefromstring($out));
    }

    public function testExifUndGpsWerdenEntfernt(): void
    {
        $path = $this->corpus->file('x', Corpus::jpegWithGps());
        self::assertStringContainsString('GPSLatitude', (string) file_get_contents($path));
        $result = $this->inspector()->inspect(self::field([['foto.jpg', $path]]));
        $out = (string) file_get_contents($result[0]->path);
        self::assertStringNotContainsString('GPSLatitude', $out);
        self::assertStringNotContainsString('Erika Muster', $out);
    }

    public function testNeutraleAnhangsnamenOhneSteuerzeichen(): void
    {
        $path = $this->corpus->file('x', Corpus::pdf());
        $result = $this->inspector()->inspect(self::field([["lebenslauf.pdf\u{202E}exe.pdf", $path]]));
        self::assertSame('bewerbung-1.pdf', $result[0]->attachmentName);
        self::assertSame('lebenslaufexe.pdf', UploadInspector::displayName("../../lebenslauf\u{202E}exe.pdf"));
    }

    public function testHarmloseOpenActionUndLinksImPdfSindErlaubt(): void
    {
        $result = $this->inspector()->inspect(self::field([['cv.pdf', $this->corpus->file('x', Corpus::pdfHarmlessOpenActionAndLink())]]));
        self::assertCount(1, $result);
    }

    public function testDocxMitNormalemExternemHyperlinkIstErlaubt(): void
    {
        $docx = $this->corpus->docx(['word/_rels/document.xml.rels' => Corpus::rel('hyperlink', 'https://www.linkedin.com/in/x', true)]);
        self::assertCount(1, $this->inspector()->inspect(self::field([['cv.docx', $docx]])));
    }

    /** @return iterable<string, array{string}> */
    public static function legitimate(): iterable
    {
        foreach (glob(__DIR__ . '/fixtures/legit/*') ?: [] as $file) {
            yield basename($file) => [$file];
        }
    }

    #[DataProvider('legitimate')]
    public function testLegitimeBewerbungsunterlagenWerdenAngenommen(string $file): void
    {
        $copy = $this->corpus->file(basename($file), (string) file_get_contents($file));
        $result = $this->inspector()->inspect(self::field([[basename($file), $copy]]));
        self::assertCount(1, $result, basename($file));
    }

    public function testCleanupEntferntAlleDateien(): void
    {
        $png = $this->corpus->file('x', Corpus::png());
        $pdf = $this->corpus->file('y', Corpus::pdf());
        $field = self::field([['a.png', $png], ['b.pdf', $pdf]]);
        $inspector = $this->inspector();
        $result = $inspector->inspect($field);
        $inspector->cleanup($field);
        foreach ([$png, $pdf, $result[0]->path] as $p) {
            self::assertFileDoesNotExist($p);
        }
    }
}
