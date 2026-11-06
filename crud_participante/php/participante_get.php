<?php

session_start();
header("Content-Type: application/json; charset=utf-8");

if (empty($_SESSION["participante_id"])) {
    http_response_code(401);
    echo json_encode(["status" => "erro", "mensagem" => "Acesso restrito. Faça login."]);
    exit;
}

require_once "conexao.php";

try {
    $id = (int) $_SESSION["participante_id"];
    $stmt = $conexao->prepare(
        "SELECT id, nome, documento, email, telefone FROM participante WHERE id = ?"
    );
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $participante = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$participante) {
        http_response_code(404);
        echo json_encode(["status" => "erro", "mensagem" => "Participante não encontrado."]);
    } else {
        echo json_encode([
            "status" => "sucesso",
            "participante" => $participante,
            "data" => $participante
        ]);
    }
} catch (mysqli_sql_exception $erro) {
    error_log("Erro ao carregar perfil do participante: " . $erro->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "erro", "mensagem" => "Não foi possível carregar o perfil."]);
}

$conexao->close();

