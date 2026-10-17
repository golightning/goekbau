<?php

declare(strict_types=1);

namespace Goekbau\Forms\Mail;

interface Mailer
{
    /** @throws MailDeliveryError */
    public function send(Message $message): void;
}
