<?php

declare(strict_types=1);

namespace Goekbau\Forms\Tests\Support;

use Goekbau\Forms\Mail\MailDeliveryError;
use Goekbau\Forms\Mail\Mailer;
use Goekbau\Forms\Mail\Message;

final class FakeMailer implements Mailer
{
    /** @var list<Message> */
    public array $sent = [];
    /** @var list<list<string>> Anhangsinhalte zum Zeitpunkt des Versands */
    public array $attachmentBytes = [];

    public function __construct(public bool $fail = false)
    {
    }

    public function send(Message $message): void
    {
        if ($this->fail) {
            throw new MailDeliveryError('SMTP nicht erreichbar');
        }
        $this->sent[] = $message;
        $this->attachmentBytes[] = array_map(fn ($f) => (string) file_get_contents($f->path), $message->attachments);
    }
}
