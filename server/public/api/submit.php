<?php

declare(strict_types=1);

// POST /api/submit.php – Kontaktanfragen und Bewerbungen (form-submissions)
require dirname(__DIR__) . '/_app/app/bootstrap.php';

$app = new GoekbauApp();
$app->submitHandler()->handle(Goekbau\Forms\Http\Request::fromGlobals())->send();
