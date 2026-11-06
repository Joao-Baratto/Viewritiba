<?php

session_start();
header("Content-Type: application/json; charset=utf-8");

if (empty($_SESSION["participante_id"])) {
    http_response_code(401);
    echo json_encode(["status" => "erro", "mensagem" => "Não autenticado."]);
    exit;
}

require_once "conexao.php";

$id = (int) $_SESSION["participante_id"];
$nome = trim($_POST["nome"] ?? "");
$email = trim($_POST["email"] ?? "");
$telefone = trim($_POST["telefone"] ?? "");
$senhaAtual = $_POST["senha_atual"] ?? "";
$novaSenha = $_POST["nova_senha"] ?? "";

if ($nome === "" || $email === "" || $telefone === "") {
    http_response_code(400);
    echo json_encode(["status" => "erro", "mensagem" => "Nome, e-mail e telefone são obrigatórios."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "erro", "mensagem" => "Informe um e-mail válido."]);
    exit;
}

try {
    $stmt = $conexao->prepare("SELECT id FROM participante WHERE email = ? AND id != ?");
    $stmt->bind_param("si", $email, $id);
    $stmt->execute();
    $emailEmUso = $stmt->get_result()->num_rows > 0;
    $stmt->close();

    if ($emailEmUso) {
        http_response_code(409);
        echo json_encode(["status" => "erro", "mensagem" => "Este e-mail já está em uso."]);
        exit;
    }

    if ($novaSenha !== "") {
        if ($senhaAtual === "" || strlen($novaSenha) < 6) {
            http_response_code(400);
            echo json_encode([
                "status" => "erro",
                "mensagem" => $senhaAtual === ""
                    ? "Informe sua senha atual para alterá-la."
                    : "A nova senha deve ter pelo menos 6 caracteres."
            ]);
            exit;
        }

        $stmt = $conexao->prepare("SELECT senha FROM participante WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $conta = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$conta || !password_verify($senhaAtual, $conta["senha"])) {
            http_response_code(401);
            echo json_encode(["status" => "erro", "mensagem" => "A senha atual está incorreta."]);
            exit;
        }

        $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $stmt = $conexao->prepare(
            "UPDATE participante SET nome = ?, email = ?, telefone = ?, senha = ? WHERE id = ?"
        );
        $stmt->bind_param("ssssi", $nome, $email, $telefone, $senhaHash, $id);
    } else {
        $stmt = $conexao->prepare(
            "UPDATE participante SET nome = ?, email = ?, telefone = ? WHERE id = ?"
        );
        $stmt->bind_param("sssi", $nome, $email, $telefone, $id);
    }

    $stmt->execute();
    $stmt->close();

    $_SESSION["participante_nome"] = $nome;
    $_SESSION["participante_email"] = $email;
    echo json_encode(["status" => "sucesso", "mensagem" => "Perfil atualizado com sucesso."]);
} catch (mysqli_sql_exception $erro) {
    error_log("Erro ao atualizar perfil do participante: " . $erro->getMessage());
    http_response_code($erro->getCode() === 1062 ? 409 : 500);
    echo json_encode([
        "status" => "erro",
        "mensagem" => $erro->getCode() === 1062
            ? "Este e-mail já está em uso."
            : "Não foi possível atualizar o perfil."
    ]);
}

$conexao->close();

