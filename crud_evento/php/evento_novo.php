<?php

session_start();

header("Content-Type: application/json; charset=utf-8");

include_once("conexao.php");

function responder($status, $mensagem)
{
    echo json_encode([
        "status" => $status,
        "mensagem" => $mensagem,
        "data" => []
    ]);

    exit;
}

if (
    !isset($_SESSION["usuario_id"]) ||
    !isset($_SESSION["usuario_tipo"]) ||
    $_SESSION["usuario_tipo"] !== "organizador"
) {
    responder(
        "nok",
        "Somente organizadores podem cadastrar eventos."
    );
}

$titulo = trim($_POST["titulo"] ?? "");
$descricao = trim($_POST["descricao"] ?? "");
$data_hora = $_POST["data_hora"] ?? "";
$local = trim($_POST["local"] ?? "");
$categorias = $_POST["categorias"] ?? [];

$id_organizador = (int) $_SESSION["usuario_id"];

if (
    $titulo === "" ||
    $descricao === "" ||
    $data_hora === "" ||
    $local === ""
) {
    responder(
        "nok",
        "Preencha corretamente todos os campos obrigatórios."
    );
}

if (count($categorias) === 0) {
    responder(
        "nok",
        "Selecione pelo menos uma categoria."
    );
}

$data_evento = DateTime::createFromFormat(
    "Y-m-d\TH:i",
    $data_hora,
    new DateTimeZone("America/Sao_Paulo")
);

$data_atual = new DateTime(
    "now",
    new DateTimeZone("America/Sao_Paulo")
);

if (!$data_evento) {
    responder(
        "nok",
        "A data e a hora informadas são inválidas."
    );
}

if ($data_evento <= $data_atual) {
    responder(
        "nok",
        "A data e a hora do evento devem ser futuras."
    );
}

$data_banco = $data_evento->format("Y-m-d H:i:s");

$stmt = $conexao->prepare(
    "INSERT INTO evento
    (
        titulo,
        descricao,
        data_hora,
        local,
        id_organizador
    )
    VALUES (?, ?, ?, ?, ?)"
);

if (!$stmt) {
    responder(
        "nok",
        "Não foi possível preparar o cadastro do evento."
    );
}

$stmt->bind_param(
    "ssssi",
    $titulo,
    $descricao,
    $data_banco,
    $local,
    $id_organizador
);

if ($stmt->execute()) {
    $id_evento = $conexao->insert_id;
    $stmt->close();

    $stmt = $conexao->prepare(
        "INSERT INTO evento_categoria (id_evento, id_categoria) VALUES (?, ?)"
    );

    foreach ($categorias as $id_categoria) {
        $id_categoria = (int) $id_categoria;
        $stmt->bind_param("ii", $id_evento, $id_categoria);
        $stmt->execute();
    }

    $stmt->close();
    $conexao->close();

    responder(
        "ok",
        "Evento cadastrado com sucesso."
    );
}

$stmt->close();
$conexao->close();

responder(
    "nok",
    "Não foi possível cadastrar o evento."
);