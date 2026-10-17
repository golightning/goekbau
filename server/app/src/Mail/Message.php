<?php

declare(strict_types=1);

namespace Goekbau\Forms\Mail;

use Goekbau\Forms\Upload\InspectedFile;

final class Message
{
    /** @param list<InspectedFile> $attachments */
    public function __construct(
        public readonly string $to,
        public readonly string $replyTo,
        public readonly string $replyToName,
        public readonly string $subject,
        public readonly string $body,
        public readonly array $attachments = [],
    ) {
    }
}
