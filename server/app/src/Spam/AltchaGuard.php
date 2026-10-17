<?php

declare(strict_types=1);

namespace Goekbau\Forms\Spam;

use AltchaOrg\Altcha\V1\Altcha;
use AltchaOrg\Altcha\V1\ChallengeOptions;
use AltchaOrg\Altcha\V1\Hasher\Algorithm;
use Goekbau\Forms\Storage\FileStore;

/**
 * spam-protection „Proof-of-Work-Prüfung (ALTCHA, selbst gehostet)“: signierte Challenge, 10 Minuten gültig,
 * jede Lösung nur einmal verwendbar. Kein Request an Dritte.
 */
final class AltchaGuard
{
    public const MAX_NUMBER = 100_000;
    public const TTL_SECONDS = 600;

    private readonly Altcha $altcha;

    public function __construct(string $hmacKey, private readonly FileStore $replayStore)
    {
        $this->altcha = new Altcha($hmacKey);
    }

    /** @return array{algorithm: string, challenge: string, maxnumber: int, salt: string, signature: string} */
    public function challenge(?int $maxNumber = null): array
    {
        $c = $this->altcha->createChallenge(new ChallengeOptions(
            algorithm: Algorithm::SHA256,
            maxNumber: $maxNumber ?? self::MAX_NUMBER,
            expires: (new \DateTimeImmutable())->modify('+' . self::TTL_SECONDS . ' seconds'),
        ));
        return [
            'algorithm' => $c->algorithm,
            'challenge' => $c->challenge,
            'maxnumber' => $c->maxNumber,
            'salt' => $c->salt,
            'signature' => $c->signature,
        ];
    }

    /** Prüft Signatur, Ablauf und Einmaligkeit. */
    public function verify(string $payload): bool
    {
        if ($payload === '' || strlen($payload) > 2000 || !$this->altcha->verifySolution($payload, true)) {
            return false;
        }
        // Replay-Schutz: dieselbe Lösung darf nur einmal angenommen werden
        return $this->replayStore->update('altcha:' . hash('sha256', $payload), self::TTL_SECONDS + 60, function ($seen) {
            return [true, $seen !== true];
        });
    }
}
