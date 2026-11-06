<?php
session_start();
header("Content-Type: application/json; charset=utf-8");
include_once("conexao.php");

if (!isset($_SESSION['participante_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Não autenticado']);
    exit;
}

$id = $_SESSION['participante_id'];

$consultas = [
    "DELETE FROM favorito WHERE tipo_conta = 'participante' AND id_usuario = ?",
    "DELETE FROM avaliacao_comentario WHERE tipo_conta = 'participante' AND id_usuario = ?",
    "DELETE FROM compartilhamento WHERE tipo_remetente = 'participante' AND id_remetente = ?",
    "DELETE FROM compartilhamento WHERE tipo_destinatario = 'participante' AND id_destinatario = ?"
];
foreach ($consultas as $sql) {
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
}

$stmt = $conexao->prepare("DELETE FROM participante WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    session_unset();
    session_destroy();
    echo json_encode(['status' => 'sucesso', 'mensagem' => 'Sua conta foi excluída com sucesso.']);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao excluir a conta no banco de dados.']);
}

$stmt->close();
$conexao->close();
?>