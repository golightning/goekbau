<?php

declare(strict_types=1);

namespace Goekbau\Forms\Security;

/** Leitet aus einem Master-Secret getrennte Schlüssel je Zweck ab (HKDF), damit kein Schlüssel doppelt dient. */
final class Keys
{
    public function __construct(private readonly string $masterSecret)
    {
    }

    public function for(string $purpose): string
    {
        return hash_hkdf('sha256', $this->masterSecret, 32, "goekbau-forms:{$purpose}");
    }
}
