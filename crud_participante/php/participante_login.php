<?php

session_start();
header("Content-Type: application/json; charset=utf-8");
require_once "conexao.php";

$identificador = trim($_POST["email"] ?? "");
$senha = $_POST["senha"] ?? "";

if ($identificador === "" || $senha === "") {
    http_response_code(400);
    echo json_encode(["status" => "erro", "mensagem" => "Informe o e-mail/CPF e a senha."]);
    exit;
}

try {
    $stmt = $conexao->prepare(
        "SELECT id, nome, email, senha FROM participante
         WHERE email = ? OR documento = ?"
    );
    $stmt->bind_param("ss", $identificador, $identificador);
    $stmt->execute();
    $participante = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$participante || !password_verify($senha, $participante["senha"])) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "E-mail/CPF ou senha incorretos."]);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION = [];
    $_SESSION["participante_id"] = (int) $participante["id"];
    $_SESSION["participante_nome"] = $participante["nome"];
    $_SESSION["participante_email"] = $participante["email"];
    $_SESSION["usuario_id"] = (int) $participante["id"];
    $_SESSION["usuario_tipo"] = "participante";

    echo json_encode(["status" => "sucesso", "mensagem" => "Login realizado com sucesso."]);
} catch (mysqli_sql_exception $erro) {
    error_log("Erro ao autenticar participante: " . $erro->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "erro", "mensagem" => "Não foi possível realizar o login."]);
}

$conexao->close();