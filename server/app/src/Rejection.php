<?php

declare(strict_types=1);

namespace Goekbau\Forms;

/**
 * Abbruch der Pipeline durch eine Schutzschicht. `layer` landet anonym im Log und in der Statistik.
 * `silent` = scheinbarer Erfolg (Honeypot), damit Bots keine Rückmeldung erhalten.
 */
final class Rejection extends \RuntimeException
{
    /** @param array<string, string> $fieldErrors */
    public function __construct(
        public readonly int $status,
        public readonly string $layer,
        public readonly string $userMessage,
        public readonly array $fieldErrors = [],
        public readonly bool $silent = false,
        public readonly ?int $retryAfter = null,
    ) {
        parent::__construct("{$layer}: {$userMessage}", $status);
    }

    public static function silent(string $layer): self
    {
        return new self(200, $layer, 'Vielen Dank! Ihre Nachricht wurde übermittelt.', [], true);
    }
}
