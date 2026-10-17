<?php

declare(strict_types=1);

namespace Goekbau\Forms\Mail;

use PHPMailer\PHPMailer\Exception as PhpMailerException;
use PHPMailer\PHPMailer\PHPMailer;

/**
 * email-security „Fester, authentifizierter Absender“: SMTP mit Authentifizierung und TLS (Zertifikatsprüfung),
 * kein Fallback auf mail(). From/Sender sind fest, Nutzeradresse nur als Reply-To.
 */
final class SmtpMailer implements Mailer
{
    public function __construct(
        private readonly string $host,
        private readonly int $port,
        private readonly string $user,
        private readonly string $pass,
        private readonly string $secure,
        private readonly string $from,
        private readonly string $fromName,
        private readonly bool $verifyPeer = true,
    ) {
    }

    public function send(Message $message): void
    {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = $this->host;
            $mail->Port = $this->port;
            $mail->SMTPAuth = true;
            $mail->Username = $this->user;
            $mail->Password = $this->pass;
            $mail->SMTPSecure = $this->secure === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->SMTPAutoTLS = true;
            $mail->Timeout = 15;
            $mail->SMTPOptions = ['ssl' => [
                'verify_peer' => $this->verifyPeer,
                'verify_peer_name' => $this->verifyPeer,
                'allow_self_signed' => false,
                'crypto_method' => STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT,
            ]];
            $mail->CharSet = PHPMailer::CHARSET_UTF8;
            $mail->Encoding = PHPMailer::ENCODING_QUOTED_PRINTABLE;
            $mail->isHTML(false);
            $mail->XMailer = ' ';

            $mail->setFrom($this->from, $this->fromName, false);
            $mail->Sender = $this->from;
            $mail->addAddress($message->to);
            if (!$mail->addReplyTo($message->replyTo, $message->replyToName)) {
                throw new MailDeliveryError('ungültige Reply-To-Adresse');
            }
            $mail->Subject = $message->subject;
            $mail->Body = $message->body;
            foreach ($message->attachments as $file) {
                $mail->addAttachment($file->path, $file->attachmentName, PHPMailer::ENCODING_BASE64, \Goekbau\Forms\Upload\FileType::mime($file->type));
            }
            $mail->send();
        } catch (PhpMailerException $e) {
            // Keine Inhalte/Adressen ins Log – nur die Fehlerart
            throw new MailDeliveryError('SMTP-Versand fehlgeschlagen', 0, $e);
        }
    }
}
