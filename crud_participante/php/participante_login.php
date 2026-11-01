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
        'SELECT id, nome, email, senha FROM participante WHERE email = ? OR documento = ? LIMIT 1'
    );
    $stmt->bind_param('ss', $identificador, $identificador);
    $stmt->execute();
    $participante = $stmt->get_result()->fetch_assoc();

    if (!$participante || !password_verify($senha, $participante['senha'])) {
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
    $banimento = obter_banimento_conta($conexao, 'participante', (int) $participante['id']);
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
    $_SESSION['papel'] = 'participante';
    $_SESSION['usuario_id'] = (int) $participante['id'];
    $_SESSION['usuario_tipo'] = 'participante';
    $_SESSION['participante_id'] = (int) $participante['id'];
    $_SESSION['participante_nome'] = $participante['nome'];
    $_SESSION['participante_email'] = $participante['email'];

    $stmt->close();
    $conexao->close();
    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Login realizado com sucesso.'
    ]);
} catch (Throwable $erro) {
    error_log('Erro no login do participante: ' . $erro->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Não foi possível concluir o login agora. Tente novamente mais tarde.'
    ]);
}