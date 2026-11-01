<?php

session_start();
header("Content-Type: application/json; charset=utf-8");

if (empty($_SESSION["participante_id"])) {
    http_response_code(401);
    echo json_encode(["status" => "erro", "mensagem" => "Não autenticado."]);
    exit;
}

require_once "conexao.php";

try {
    $id = (int) $_SESSION["participante_id"];
    $stmt = $conexao->prepare("DELETE FROM participante WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $excluido = $stmt->affected_rows > 0;
    $stmt->close();
    $conexao->close();

    if (!$excluido) {
        http_response_code(404);
        echo json_encode(["status" => "erro", "mensagem" => "Participante não encontrado."]);
        exit;
    }

    session_unset();
    session_destroy();
    echo json_encode(["status" => "sucesso", "mensagem" => "Sua conta foi excluída com sucesso."]);
} catch (mysqli_sql_exception $erro) {
    error_log("Erro ao excluir conta de participante: " . $erro->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "erro", "mensagem" => "Não foi possível excluir sua conta."]);
    $conexao->close();
}