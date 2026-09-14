<?php

session_start();
header("Content-Type: application/json; charset=utf-8");

include_once("conexao.php");

$email = trim($_POST['email'] ?? '');
$senha = $_POST['senha'] ?? '';

if ($email === '' || $senha === '') {
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Informe o e-mail e a senha.'
    ]);
    exit;
}

$stmt = $conexao->prepare(
    "SELECT id_usuario, nome, email, tipo_usuario, senha, status_usuario
     FROM usuario
     WHERE email = ? AND tipo_usuario = 'organizador'"
);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();
$organizador = $resultado->fetch_assoc();

if ($organizador && $organizador['status_usuario'] == 'ativo' && password_verify($senha, $organizador['senha'])) {
    session_regenerate_id(true);
    $_SESSION['usuario'] = [$organizador];
    $_SESSION['usuario_id'] = (int) $organizador['id_usuario'];
    $_SESSION['usuario_tipo'] = $organizador['tipo_usuario'];
    $_SESSION['organizador_id'] = (int) $organizador['id_usuario'];
    $_SESSION['organizador_nome'] = $organizador['nome'];
    $_SESSION['organizador_email'] = $organizador['email'];

    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Login realizado com sucesso.'
    ]);
} else {
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'E-mail ou senha incorretos.'
    ]);
}

$stmt->close();
$conexao->close();
