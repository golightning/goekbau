<?php

declare(strict_types=1);

namespace Goekbau\Forms\Mail;

use Goekbau\Forms\Upload\InspectedFile;
use Goekbau\Forms\Upload\MalwareLookup;

/**
 * email-security „Schutz vor Header-Injection“ und „Sichere Mail-Inhalte“: Header-Werte bereinigt und begrenzt,
 * Text als reiner Text, Nutzereingaben nur als Daten.
 */
final class MessageComposer
{
    public const SUBJECT_MAX = 150;
    public const NAME_MAX = 120;

    /** Entfernt CR/LF, Unicode-Zeilen-/Absatztrenner und alle Steuerzeichen, kürzt auf $max Zeichen. */
    public static function headerValue(string $value, int $max): string
    {
        $clean = (string) preg_replace('/[\p{Cc}\p{Cf}\x{2028}\x{2029}]+/u', ' ', $value);
        $clean = trim((string) preg_replace('/\s+/u', ' ', $clean));
        return mb_substr($clean, 0, $max);
    }

    /** @param array<string, string> $fields bereinigte Formularwerte */
    public function contact(array $fields, string $to): Message
    {
        $name = self::headerValue($fields['name'] ?? '', self::NAME_MAX);
        $body = $this->body('Neue Kontaktanfrage über goekbau.de', [
            'Name' => $fields['name'] ?? '',
            'E-Mail' => $fields['email'] ?? '',
            'Telefon' => ($fields['phone'] ?? '') !== '' ? $fields['phone'] : '–',
            'Nachricht' => $fields['message'] ?? '',
        ]);
        return new Message(
            to: $to,
            replyTo: $fields['email'],
            replyToName: $name,
            subject: self::headerValue("Kontaktanfrage von {$name} (goekbau.de)", self::SUBJECT_MAX),
            body: $body,
        );
    }

    /**
     * @param array<string, string> $fields
     * @param list<InspectedFile> $files
     */
    public function application(array $fields, array $files, string $to): Message
    {
        $name = self::headerValue($fields['name'] ?? '', self::NAME_MAX);
        $position = self::headerValue($fields['position'] ?? '', 100);
        $unchecked = array_filter($files, fn (InspectedFile $f) => $f->malwareCheck !== MalwareLookup::CLEAN);
        $prefix = $unchecked ? '[Anhang ungeprüft] ' : '';

        $fileLines = [];
        foreach ($files as $f) {
            $fileLines[] = sprintf(
                "- %s (%s, %s KB)\n  SHA-256: %s\n  Prüfung: Typ/Inhalt geprüft%s; Malware-Datenbank: %s",
                $f->attachmentName,
                strtoupper($f->type),
                number_format($f->size / 1024, 0, ',', '.'),
                $f->sha256,
                $f->reencoded ? ', Bild neu kodiert' : '',
                match ($f->malwareCheck) {
                    MalwareLookup::CLEAN => 'nicht gelistet',
                    default => 'nicht erreichbar – ungeprüft',
                },
            );
        }

        $body = $this->body('Neue Bewerbung über goekbau.de', [
            'Position' => $fields['position'] ?? '',
            'Name' => $fields['name'] ?? '',
            'E-Mail' => $fields['email'] ?? '',
            'Telefon' => ($fields['phone'] ?? '') !== '' ? $fields['phone'] : '–',
            'Nachricht' => ($fields['message'] ?? '') !== '' ? $fields['message'] : '–',
        ]) . "\n\nAnhänge\n-------\n" . implode("\n", $fileLines) . "\n";

        return new Message(
            to: $to,
            replyTo: $fields['email'],
            replyToName: $name,
            subject: self::headerValue("{$prefix}Bewerbung: {$position} – {$name}", self::SUBJECT_MAX),
            body: $body,
            attachments: $files,
        );
    }

    /** @param array<string, string> $fields */
    private function body(string $title, array $fields): string
    {
        $lines = [$title, str_repeat('=', mb_strlen($title)), ''];
        foreach ($fields as $label => $value) {
            // Wert unverändert als Text; Zeilenumbrüche im Fließtext bleiben erhalten, nichts wird interpretiert
            $value = str_replace(["\r\n", "\r"], "\n", $value);
            $lines[] = str_contains($value, "\n") ? "{$label}:\n{$value}\n" : "{$label}: {$value}";
        }
        $lines[] = '';
        $lines[] = '—';
        $lines[] = 'Antworten Sie direkt auf diese E-Mail, um der absendenden Person zu antworten.';
        $lines[] = 'Diese Nachricht wurde über das Formular auf www.goekbau.de gesendet und nicht auf dem Webserver gespeichert.';
        return implode("\n", $lines);
    }
}
