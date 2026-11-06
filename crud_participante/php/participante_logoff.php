<?php

session_start();
$_SESSION = [];
session_destroy();

if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'ok', 'mensagem' => 'Sessão encerrada com sucesso.']);
    exit;
}

header('Location: ../login/login.html');
exit;

