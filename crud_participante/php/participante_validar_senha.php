<?php
session_start();
header("Content-Type: application/json; charset=utf-8");
include_once("conexao.php");

if (!isset($_SESSION['participante_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Acesso não autorizado. Faça login novamente.']);
    exit;
}

$id = (int) $_SESSION['participante_id'];
$senha_atual = $_POST['senha_atual'] ?? '';

if (empty($senha_atual)) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Por favor, digite sua senha atual.']);
    exit;
}

$stmt = $conexao->prepare("SELECT senha FROM participante WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$resultado = $stmt->get_result();

if ($participante = $resultado->fetch_assoc()) {
    if (password_verify($senha_atual, $participante['senha'])) {
        echo json_encode([
            'status' => 'sucesso',
            'mensagem' => 'Senha atual confirmada com sucesso! Você já pode definir sua nova senha.'
        ]);
    } else {
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Senha atual incorreta. Verifique e tente novamente.'
        ]);
    }
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Participante não encontrado.']);
}

$stmt->close();
$conexao->close();
?>