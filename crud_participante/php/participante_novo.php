<?php

header("Content-Type: application/json; charset=utf-8");
require_once "conexao.php";

$nome = trim($_POST["nome"] ?? "");
$documento = trim($_POST["documento"] ?? "");
$email = trim($_POST["email"] ?? "");
$telefone = trim($_POST["telefone"] ?? "");
$senha = $_POST["senha"] ?? "";

if ($nome === "" || $documento === "" || $email === "" || $telefone === "" || $senha === "") {
    http_response_code(400);
    echo json_encode(["status" => "erro", "mensagem" => "Preencha todos os campos obrigatórios."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "erro", "mensagem" => "Informe um e-mail válido."]);
    exit;
}

if (strlen($senha) < 6) {
    http_response_code(400);
    echo json_encode(["status" => "erro", "mensagem" => "A senha deve ter pelo menos 6 caracteres."]);
    exit;
}

$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

try {
    $stmt = $conexao->prepare(
        "INSERT INTO participante (nome, documento, email, telefone, senha)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("sssss", $nome, $documento, $email, $telefone, $senhaHash);
    $stmt->execute();
    $stmt->close();

    echo json_encode(["status" => "sucesso", "mensagem" => "Participante cadastrado com sucesso!"]);
} catch (mysqli_sql_exception $erro) {
    error_log("Erro ao cadastrar participante: " . $erro->getMessage());
    http_response_code($erro->getCode() === 1062 ? 409 : 500);
    echo json_encode([
        "status" => "erro",
        "mensagem" => $erro->getCode() === 1062
            ? "Este e-mail ou documento já está cadastrado."
            : "Não foi possível concluir o cadastro."
    ]);
}

$conexao->close();
