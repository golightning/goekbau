<?php

declare(strict_types=1);

namespace Goekbau\Forms\Http;

/** Unveränderliche Sicht auf den eingehenden Request – in Tests direkt konstruierbar. */
final class Request
{
    /**
     * @param array<string, mixed> $post
     * @param array<string, mixed> $files  $_FILES-Struktur
     * @param array<string, string> $headers Kleinbuchstaben-Schlüssel
     */
    public function __construct(
        public readonly string $method,
        public readonly array $post,
        public readonly array $files,
        public readonly array $headers,
        public readonly string $remoteAddr,
        public readonly int $contentLength,
        public readonly string $contentType,
    ) {
    }

    public static function fromGlobals(): self
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_') && is_string($value)) {
                $headers[strtolower(str_replace('_', '-', substr($key, 5)))] = $value;
            }
        }
        return new self(
            strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')),
            $_POST,
            $_FILES,
            $headers,
            (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'),
            (int) ($_SERVER['CONTENT_LENGTH'] ?? 0),
            (string) ($_SERVER['CONTENT_TYPE'] ?? ''),
        );
    }

    public function header(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }

    public function string(string $key): string
    {
        $value = $this->post[$key] ?? '';
        return is_string($value) ? $value : '';
    }
}
