<?php

declare(strict_types=1);

namespace Goekbau\Forms\Validation;

/**
 * Serverseitige Feldprüfung nach shared/forms.json – identische Regeln und Texte wie src/forms/validate.ts.
 * form-submissions „Serverseitige Validierung“.
 */
final class FieldValidator
{
    // Gleiche Regel wie der Client: praxisnahe RFC-5322-Teilmenge (Punkt-Atome, Domain mit TLD)
    private const EMAIL = '/^[A-Za-z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/';

    /** @param array<string, mixed> $schema */
    public function __construct(private readonly array $schema)
    {
    }

    public static function fromFile(string $file): self
    {
        return new self(json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR));
    }

    public function hasForm(string $form): bool
    {
        return isset($this->schema['forms'][$form]);
    }

    /** @return list<array<string, mixed>> */
    public function fields(string $form): array
    {
        return $this->schema['forms'][$form]['fields'] ?? [];
    }

    public function formLabel(string $form): string
    {
        return (string) ($this->schema['forms'][$form]['label'] ?? $form);
    }

    /** @return array<string, mixed> */
    public function limits(): array
    {
        return $this->schema['limits'];
    }

    /**
     * @param array<string, mixed> $input
     * @return array<string, string> Feldname → Fehlermeldung
     */
    public function validate(string $form, array $input, int $fileCount = 0): array
    {
        $errors = [];
        foreach ($this->fields($form) as $field) {
            $name = $field['name'];
            $raw = $input[$name] ?? '';
            $value = is_string($raw) ? trim($raw) : '';
            $required = (bool) ($field['required'] ?? false);

            if ($field['type'] === 'files') {
                if ($required && $fileCount === 0) {
                    $errors[$name] = $this->msg('filesRequired');
                }
                continue;
            }
            if ($field['type'] === 'consent') {
                if ($required && $value === '') {
                    $errors[$name] = $this->msg('consent');
                }
                continue;
            }
            if ($value === '') {
                if ($required) {
                    $errors[$name] = $this->msg('required');
                }
                continue;
            }
            if (!mb_check_encoding($value, 'UTF-8')) {
                $errors[$name] = $this->msg('required');
                continue;
            }
            $length = mb_strlen($value);
            if (isset($field['maxLength']) && $length > $field['maxLength']) {
                $errors[$name] = $this->msg('tooLong', ['max' => $field['maxLength']]);
            } elseif (isset($field['minLength']) && $length < $field['minLength']) {
                $errors[$name] = $this->msg('tooShort', ['min' => $field['minLength']]);
            } elseif ($field['type'] === 'email' && !preg_match(self::EMAIL, $value)) {
                $errors[$name] = $this->msg('email');
            } elseif (isset($field['pattern']) && !preg_match('/' . str_replace('/', '\/', $field['pattern']) . '/u', $value)) {
                $errors[$name] = $this->msg('pattern');
            }
        }
        return $errors;
    }

    /**
     * Nur bekannte Felder, getrimmt (form-submissions: unbekannte Felder werden ignoriert).
     * @param array<string, mixed> $input
     * @return array<string, string>
     */
    public function clean(string $form, array $input): array
    {
        $out = [];
        foreach ($this->fields($form) as $field) {
            if (in_array($field['type'], ['files'], true)) {
                continue;
            }
            $raw = $input[$field['name']] ?? '';
            $out[$field['name']] = is_string($raw) ? trim($raw) : '';
        }
        return $out;
    }

    /** @param array<string, int|string> $vars */
    public function msg(string $key, array $vars = []): string
    {
        $text = (string) ($this->schema['messages'][$key] ?? $key);
        foreach ($vars as $k => $v) {
            $text = str_replace('{' . $k . '}', (string) $v, $text);
        }
        return $text;
    }
}
