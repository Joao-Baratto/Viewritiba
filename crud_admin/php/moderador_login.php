<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$usuario = trim($_POST['usuario'] ?? '');
$senha = $_POST['senha'] ?? '';

if ($usuario === '' || $senha === '') {
    http_response_code(400);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Informe o usuário e a senha.'
    ]);
    exit;
}

require_once __DIR__ . '/autenticacao_moderador.php';
if (!autenticar_moderador($usuario, $senha)) {
    http_response_code(401);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Usuário ou senha incorretos.'
    ]);
    exit;
}

echo json_encode([
    'status' => 'sucesso',
    'mensagem' => 'Login realizado com sucesso.'
]);
