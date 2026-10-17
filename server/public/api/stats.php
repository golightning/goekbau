<?php

declare(strict_types=1);

// GET /api/stats.php?day=YYYY-MM-DD – anonyme Tageszähler je Schutzschicht, nur mit Monitor-Token (spam-protection)
use Goekbau\Forms\Http\JsonResponse;

require dirname(__DIR__) . '/_app/app/bootstrap.php';

$app = new GoekbauApp();
$expected = (string) $app->config->get('GOEKBAU_MONITOR_TOKEN', '');
$auth = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
$provided = str_starts_with($auth, 'Bearer ') ? substr($auth, 7) : '';
if (strlen($expected) < 32 || !hash_equals($expected, $provided)) {
    (new JsonResponse(404, ['ok' => false, 'message' => 'Nicht gefunden.']))->send();
    exit;
}
$day = (string) ($_GET['day'] ?? gmdate('Y-m-d'));
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $day)) {
    (new JsonResponse(400, ['ok' => false, 'message' => 'Ungültiges Datum.']))->send();
    exit;
}
(new JsonResponse(200, ['ok' => true, 'day' => $day, 'counts' => (object) $app->stats()->forDay($day)]))->send();
