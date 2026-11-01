<?php
session_start();
header("Content-Type: application/json; charset=utf-8");
include_once("conexao.php");

if (!isset($_SESSION['organizador_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Não autenticado']);
    exit;
}

$id = $_SESSION['organizador_id'];

$stmt = $conexao->prepare("DELETE FROM organizador WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // Destrói a sessão após excluir do banco de dados
    session_unset();
    session_destroy();
    echo json_encode(['status' => 'sucesso', 'mensagem' => 'Sua conta foi excluída com sucesso.']);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao excluir a conta no banco de dados.']);
}

$stmt->close();
$conexao->close();
?>
