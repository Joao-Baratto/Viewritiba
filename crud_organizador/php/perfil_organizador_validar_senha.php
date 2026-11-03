<?php
session_start();
header("Content-Type: application/json; charset=utf-8");
include_once("conexao.php");

// Garante que o organizador esteja autenticado
if (!isset($_SESSION['organizador_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Acesso não autorizado. Faça login novamente.']);
    exit;
}

$id = (int) $_SESSION['organizador_id'];
$senha_atual = $_POST['senha_atual'] ?? '';

if (empty($senha_atual)) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Por favor, digite sua senha atual.']);
    exit;
}

// Busca a senha criptografada do organizador no banco de dados
$stmt = $conexao->prepare("SELECT senha FROM organizador WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$resultado = $stmt->get_result();

if ($organizador = $resultado->fetch_assoc()) {
    if (password_verify($senha_atual, $organizador['senha'])) {
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
    echo json_encode(['status' => 'erro', 'mensagem' => 'Organizador não encontrado.']);
}

$stmt->close();
$conexao->close();
?>
