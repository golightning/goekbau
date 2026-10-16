<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header_remove('X-Powered-By');

function respond(int $status, array $data): never
{
    http_response_code($status);
    echo json_encode($data, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Kein phpinfo(), keine Pfade oder Umgebungsvariablen in der Antwort.
// Token per Deploy-Now-Runtime-Template erzeugen, nie einchecken.
$expected = trim((string) @file_get_contents(dirname(__DIR__) . '/.spike-token'));
$provided = $_SERVER['HTTP_X_SPIKE_TOKEN'] ?? '';
if (strlen($expected) < 32 || !hash_equals($expected, $provided)) {
    respond(404, ['error' => 'Nicht gefunden']);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    respond(405, ['error' => 'Methode nicht erlaubt']);
}

function tlsContext(): mixed
{
    return stream_context_create(['ssl' => [
        'verify_peer' => true, 'verify_peer_name' => true,
        'allow_self_signed' => false, 'peer_name' => 'smtp.ionos.de',
    ]]);
}

function smtpReply(mixed $stream, int $code): bool
{
    // Begrenzte Antwortlänge und Zeit; keine Anmeldung, keine Testmail.
    for ($i = 0; $i < 30; $i++) {
        $line = fgets($stream, 1024);
        if ($line === false || (int) substr($line, 0, 3) !== $code) {
            return false;
        }
        if (substr($line, 3, 1) === ' ') {
            return true;
        }
    }
    return false;
}

function smtpProbe(int $port): bool
{
    $scheme = $port === 465 ? 'ssl' : 'tcp';
    $stream = @stream_socket_client("$scheme://smtp.ionos.de:$port", $errno, $error, 3,
        STREAM_CLIENT_CONNECT, tlsContext());
    if ($stream === false) {
        return false;
    }
    stream_set_timeout($stream, 3);
    try {
        if (!smtpReply($stream, 220)) {
            return false;
        }
        if ($port === 465) {
            return true;
        }
        fwrite($stream, "EHLO spike.invalid\r\n");
        if (!smtpReply($stream, 250)) {
            return false;
        }
        fwrite($stream, "STARTTLS\r\n");
        return smtpReply($stream, 220)
            && @stream_socket_enable_crypto($stream, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) === true;
    } finally {
        fclose($stream);
    }
}

function httpsProbe(): array
{
    // Nur Erreichbarkeit/TLS, kein Hash-Lookup und keine Bewerberdaten.
    $url = 'https://mb-api.abuse.ch/api/v1/';
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_NOBODY => true, CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => 3,
            CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_FOLLOWLOCATION => false,
        ]);
        $result = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);
        return ['transport_ok' => $result !== false && $status > 0, 'http_status' => $status];
    }
    $context = stream_context_create([
        'http' => ['method' => 'HEAD', 'timeout' => 3, 'ignore_errors' => true, 'follow_location' => 0],
        'ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'allow_self_signed' => false],
    ]);
    $stream = @fopen($url, 'r', false, $context);
    if ($stream === false) {
        return ['transport_ok' => false, 'http_status' => 0];
    }
    fclose($stream);
    preg_match('/^HTTP\/\S+ (\d{3})/', $http_response_header[0] ?? '', $match);
    return ['transport_ok' => isset($match[1]), 'http_status' => (int) ($match[1] ?? 0)];
}

function storageProbe(): array
{
    $root = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
    if ($root === false || $root === '/') {
        return ['outside_document_root' => false, 'writable' => false, 'previous_request_seen' => false];
    }
    $directory = dirname($root) . '/goekbau-spike-state';
    if ((!is_dir($directory) && !@mkdir($directory, 0700)) || is_link($directory)) {
        return ['outside_document_root' => false, 'writable' => false, 'previous_request_seen' => false];
    }
    $resolved = realpath($directory);
    $outside = $resolved !== false && $resolved !== $root && !str_starts_with($resolved, $root . '/');
    $file = $directory . '/probe';
    if (!$outside || is_link($file)) {
        return ['outside_document_root' => false, 'writable' => false, 'previous_request_seen' => false];
    }
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        return ['outside_document_root' => true, 'writable' => false, 'previous_request_seen' => false];
    }
    try {
        if (!flock($handle, LOCK_EX)) {
            return ['outside_document_root' => true, 'writable' => false, 'previous_request_seen' => false];
        }
        $previous = trim((string) stream_get_contents($handle)) === 'goekbau-spike';
        rewind($handle);
        $written = fwrite($handle, 'goekbau-spike') === strlen('goekbau-spike') && fflush($handle);
        @chmod($file, 0600);
        flock($handle, LOCK_UN);
        return ['outside_document_root' => true, 'writable' => $written, 'previous_request_seen' => $previous];
    } finally {
        fclose($handle);
    }
}

try {
    $extensions = [];
    foreach (['fileinfo', 'gd', 'imagick', 'zip', 'zlib', 'openssl', 'curl', 'dom', 'libxml'] as $name) {
        $extensions[$name] = extension_loaded($name);
    }
    respond(200, [
        'php_version' => PHP_VERSION,
        'extensions' => $extensions,
        'limits' => [
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'max_file_uploads' => ini_get('max_file_uploads'),
            'memory_limit' => ini_get('memory_limit'),
        ],
        'storage' => storageProbe(),
        'https_abuse_ch' => httpsProbe(),
        'smtp_tls' => ['465' => smtpProbe(465), '587' => smtpProbe(587)],
    ]);
} catch (Throwable $error) {
    respond(500, ['error' => 'Hosting-Test fehlgeschlagen']);
}
