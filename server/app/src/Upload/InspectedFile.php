<?php

declare(strict_types=1);

namespace Goekbau\Forms\Upload;

final class InspectedFile
{
    public function __construct(
        public readonly string $path,
        public readonly string $type,
        public readonly string $attachmentName,
        public readonly int $size,
        public readonly string $sha256,
        public readonly string $malwareCheck,
        public readonly bool $reencoded,
    ) {
    }
}
