<?php

declare(strict_types=1);

// GET /api/challenge.php?form=contact|application – ALTCHA-Challenge + signiertes Formular-Token (spam-protection)
use Goekbau\Forms\Http\JsonResponse;

require dirname(__DIR__) . '/_app/app/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    (new JsonResponse(405, ['ok' => false, 'message' => 'Methode nicht erlaubt.'], ['Allow' => 'GET']))->send();
    exit;
}
$form = (string) ($_GET['form'] ?? '');
if (!in_array($form, ['contact', 'application'], true)) {
    (new JsonResponse(400, ['ok' => false, 'message' => 'Ungültige Anfrage.']))->send();
    exit;
}

$app = new GoekbauApp();
$limiter = $app->rateLimiter();
$retry = $limiter->hit('challenge', $limiter->hash((string) ($_SERVER['REMOTE_ADDR'] ?? '')), [[3600, 60]]);
if ($retry !== null) {
    (new JsonResponse(429, ['ok' => false, 'message' => 'Zu viele Anfragen.'], ['Retry-After' => (string) $retry]))->send();
    exit;
}

(new JsonResponse(200, [
    'ok' => true,
    'token' => $app->formTokens()->issue($form),
    'altcha' => $app->altcha()->challenge(),
]))->send();
