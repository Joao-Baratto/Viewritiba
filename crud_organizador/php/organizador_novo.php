<?php

header('Content-Type: application/json; charset=utf-8');

$nome = trim($_POST['nome'] ?? '');
$documento = trim($_POST['documento'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefone = trim($_POST['telefone'] ?? '');
$senha = $_POST['senha'] ?? '';

if ($nome === '' || $documento === '' || $email === '' || $telefone === '' || $senha === '') {
    http_response_code(400);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Preencha todos os campos obrigatórios.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Informe um e-mail válido.'
    ]);
    exit;
}

if (strlen($senha) < 6) {
    http_response_code(400);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'A senha deve ter pelo menos 6 caracteres.'
    ]);
    exit;
}

try {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    require __DIR__ . '/conexao.php';

    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
    $stmt = $conexao->prepare(
        'INSERT INTO organizador (nome, documento, email, telefone, senha) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssss', $nome, $documento, $email, $telefone, $senha_hash);
    $stmt->execute();
    $stmt->close();
    $conexao->close();

    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Organizador cadastrado com sucesso!',
        'data' => []
    ]);
} catch (mysqli_sql_exception $erro) {
    if ((int) $erro->getCode() === 1062) {
        http_response_code(409);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'O e-mail ou documento já está cadastrado.'
        ]);
        exit;
    }

    error_log('Erro no cadastro de organizador: ' . $erro->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Não foi possível concluir o cadastro agora. Tente novamente mais tarde.'
    ]);
} catch (Throwable $erro) {
    error_log('Erro no cadastro de organizador: ' . $erro->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Não foi possível concluir o cadastro agora. Tente novamente mais tarde.'
    ]);
}