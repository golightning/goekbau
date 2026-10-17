<?php

declare(strict_types=1);

namespace Goekbau\Forms\Http;

final class JsonResponse
{
    /**
     * @param array<string, mixed> $body
     * @param array<string, string> $headers
     */
    public function __construct(
        public readonly int $status,
        public readonly array $body,
        public readonly array $headers = [],
    ) {
    }

    public function send(): void
    {
        http_response_code($this->status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Robots-Tag: noindex, nofollow');
        header_remove('X-Powered-By');
        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }
        echo json_encode($this->body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }
}
