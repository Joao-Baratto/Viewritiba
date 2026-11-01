<?php

session_start();
header('Content-Type: application/json; charset=utf-8');

$identificador = trim($_POST['email'] ?? '');
$senha = $_POST['senha'] ?? '';

if ($identificador === '' || $senha === '') {
    http_response_code(400);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Informe o e-mail/documento e a senha.'
    ]);
    exit;
}

try {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    require __DIR__ . '/conexao.php';

    $stmt = $conexao->prepare(
        'SELECT id, nome, email, senha FROM organizador WHERE email = ? OR documento = ? LIMIT 1'
    );
    $stmt->bind_param('ss', $identificador, $identificador);
    $stmt->execute();
    $organizador = $stmt->get_result()->fetch_assoc();

    if (!$organizador || !password_verify($senha, $organizador['senha'])) {
        http_response_code(401);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'E-mail/documento ou senha incorretos.'
        ]);
        $stmt->close();
        $conexao->close();
        exit;
    }

    require_once __DIR__ . '/../../crud_admin/php/banimentos.php';
    $banimento = obter_banimento_conta($conexao, 'organizador', (int) $organizador['id']);
    if ($banimento !== null) {
        mostrar_pagina_banimento($banimento);
        http_response_code(403);
        echo json_encode([
            'status' => 'banido',
            'mensagem' => 'Esta conta está suspensa.',
            'redirect' => '../../crud_admin/conta_banida.php'
        ]);
        $stmt->close();
        $conexao->close();
        exit;
    }

    session_regenerate_id(true);
    $_SESSION = [];
    $_SESSION['papel'] = 'organizador';
    $_SESSION['organizador_id'] = (int) $organizador['id'];
    $_SESSION['organizador_nome'] = $organizador['nome'];
    $_SESSION['organizador_email'] = $organizador['email'];

    $stmt->close();
    $conexao->close();
    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Login realizado com sucesso.'
    ]);
} catch (Throwable $erro) {
    error_log('Erro no login do organizador: ' . $erro->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Não foi possível concluir o login agora. Tente novamente mais tarde.'
    ]);
}
