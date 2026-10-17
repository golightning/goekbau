<?php

declare(strict_types=1);

namespace Goekbau\Forms\Validation;

/** spam-protection „Prüfung der Absenderadresse“: Domain mit MX/A-Eintrag, keine Wegwerf-Domain. */
final class EmailDomainCheck
{
    /** @var array<string, true> */
    private readonly array $disposable;

    /**
     * @param list<string> $disposableDomains
     * @param callable(string): bool|null $resolver true, wenn die Domain einen MX- oder A-Eintrag hat
     */
    public function __construct(array $disposableDomains, private readonly mixed $resolver = null)
    {
        $this->disposable = array_fill_keys(array_map('strtolower', $disposableDomains), true);
    }

    public static function withList(string $file): self
    {
        $domains = is_file($file) ? file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
        return new self(array_values(array_filter(
            array_map('trim', $domains ?: []),
            fn (string $d) => $d !== '' && !str_starts_with($d, '#'),
        )));
    }

    /** @return string|null 'disposable' | 'unreachable' | null */
    public function check(string $email): ?string
    {
        $domain = strtolower((string) substr(strrchr($email, '@') ?: '', 1));
        if ($domain === '') {
            return 'unreachable';
        }
        // Auch Subdomains bekannter Wegwerf-Anbieter
        $parts = explode('.', $domain);
        for ($i = 0; $i < count($parts) - 1; $i++) {
            if (isset($this->disposable[implode('.', array_slice($parts, $i))])) {
                return 'disposable';
            }
        }
        $resolve = $this->resolver ?? static fn (string $d): bool => checkdnsrr($d . '.', 'MX') || checkdnsrr($d . '.', 'A') || checkdnsrr($d . '.', 'AAAA');
        return $resolve($domain) ? null : 'unreachable';
    }
}
