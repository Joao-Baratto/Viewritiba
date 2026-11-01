<?php
session_start();
header("Content-Type: application/json; charset=utf-8");
include_once("conexao.php");

if (!isset($_SESSION['organizador_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Não autenticado']);
    exit;
}

$id = $_SESSION['organizador_id'];
$nova_senha = $_POST['nova_senha'] ?? '';

if (strlen($nova_senha) < 6) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'A nova senha deve ter pelo menos 6 caracteres.']);
    exit;
}

$senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);

$stmt = $conexao->prepare("UPDATE organizador SET senha = ? WHERE id = ?");
$stmt->bind_param("si", $senha_hash, $id);

if ($stmt->execute()) {
    echo json_encode(['status' => 'sucesso', 'mensagem' => 'Senha atualizada com sucesso.']);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao atualizar a senha.']);
}

$stmt->close();
$conexao->close();
?>
