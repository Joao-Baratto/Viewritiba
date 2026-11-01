<?php
session_start();
header("Content-Type: application/json; charset=utf-8");
include_once("conexao.php");

if (!isset($_SESSION['organizador_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Não autenticado']);
    exit;
}

$id = $_SESSION['organizador_id'];
$nome = $_POST['nome'] ?? '';
$bio = $_POST['bio'] ?? '';
$email = $_POST['email'] ?? '';
$telefone = $_POST['telefone'] ?? '';

if ($nome === '' || $email === '') {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Nome e e-mail são obrigatórios.']);
    exit;
}

// Verifica se o e-mail já existe em outro organizador
$check = $conexao->prepare("SELECT id FROM organizador WHERE email = ? AND id != ?");
$check->bind_param("si", $email, $id);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Este e-mail já está em uso.']);
    $check->close();
    exit;
}
$check->close();

$nova_senha = $_POST['nova_senha'] ?? '';

if (!empty($nova_senha)) {
    $senha_atual = $_POST['senha_atual'] ?? '';
    if (empty($senha_atual)) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Informe a senha atual para autorizar a alteração de senha.']);
        exit;
    }

    // Busca a senha atual do organizador
    $stmtVerifica = $conexao->prepare("SELECT senha FROM organizador WHERE id = ?");
    $stmtVerifica->bind_param("i", $id);
    $stmtVerifica->execute();
    $resVerifica = $stmtVerifica->get_result();
    $rowSenha = $resVerifica->fetch_assoc();
    $stmtVerifica->close();

    if (!$rowSenha || !password_verify($senha_atual, $rowSenha['senha'])) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'A senha atual informada está incorreta.']);
        exit;
    }

    if (strlen($nova_senha) < 6) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'A nova senha deve ter no mínimo 6 caracteres.']);
        exit;
    }
    $senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);
    $stmt = $conexao->prepare("UPDATE organizador SET nome = ?, bio = ?, email = ?, telefone = ?, senha = ? WHERE id = ?");
    $stmt->bind_param("sssssi", $nome, $bio, $email, $telefone, $senha_hash, $id);
} else {
    $stmt = $conexao->prepare("UPDATE organizador SET nome = ?, bio = ?, email = ?, telefone = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $nome, $bio, $email, $telefone, $id);
}

if ($stmt->execute()) {
    $_SESSION['organizador_nome'] = $nome;
    $_SESSION['organizador_email'] = $email;
    echo json_encode(['status' => 'sucesso', 'mensagem' => 'Perfil atualizado com sucesso.']);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao atualizar o perfil.']);
}

$stmt->close();
$conexao->close();
?>
