<?php
require_once __DIR__ . '/proteger_admin.php';
exigir_moderador(true);

$_SESSION = [];
session_destroy();

echo json_encode(['status' => 'ok', 'mensagem' => 'Sessão encerrada.']);
