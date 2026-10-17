<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests;

use Goekbau\Forms\Validation\FieldValidator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/** Task 7.1: dieselben Fälle wie src/forms/validate.test.ts (shared/form-cases.json). */
final class FieldValidatorTest extends TestCase
{
    private static function validator(): FieldValidator
    {
        return FieldValidator::fromFile(dirname(__DIR__, 2) . '/shared/forms.json');
    }

    /** @return iterable<string, array{array<string, mixed>}> */
    public static function sharedCases(): iterable
    {
        $data = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/shared/form-cases.json'), true);
        foreach ($data['cases'] as $case) {
            yield $case['name'] => [$case];
        }
    }

    /** @param array<string, mixed> $case */
    #[DataProvider('sharedCases')]
    public function testGemeinsameFaelleLiefernDieselbenFehlerfelder(array $case): void
    {
        $errors = self::validator()->validate($case['form'], $case['input'], $case['fileCount'] ?? 0);
        $fields = array_keys($errors);
        sort($fields);
        $expected = $case['errors'];
        sort($expected);
        self::assertSame($expected, $fields);
    }

    public function testUnbekannteFelderWerdenIgnoriert(): void
    {
        $clean = self::validator()->clean('contact', ['name' => ' Max ', 'admin' => '1', 'email' => 'a@b.de']);
        self::assertSame('Max', $clean['name']);
        self::assertArrayNotHasKey('admin', $clean);
    }

    public function testNichtTextwerteGeltenAlsLeer(): void
    {
        $errors = self::validator()->validate('contact', ['name' => ['x'], 'email' => 'a@b.de', 'message' => 'Lange genug Nachricht', 'privacy' => 'on']);
        self::assertArrayHasKey('name', $errors);
    }
}
