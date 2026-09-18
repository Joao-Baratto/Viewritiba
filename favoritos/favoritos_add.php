<?php
session_start();
include_once('../crud_evento/php/conexao.php');
header("Content-type:application/json;charset=utf-8");

$retorno = ['status' => '', 'mensagem' => '', 'data' => []];

if (!isset($_SESSION['usuario'][0]['id_usuario'])) {
    $retorno = ['status' => 'nok', 'mensagem' => 'Usuário não logado', 'data' => []];
    echo json_encode($retorno);
    exit;
}

$id_usuario = $_SESSION['usuario'][0]['id_usuario'];
$id_evento = (int) ($_POST['evento_id'] ?? 0);

$stmt = $conexao->prepare("INSERT INTO favorito (id_usuario, id_evento) VALUES (?, ?)");
$stmt->bind_param("ii", $id_usuario, $id_evento);

if ($stmt->execute()) {
    $retorno = ['status' => 'ok', 'mensagem' => 'Evento adicionado aos favoritos com sucesso!', 'data' => []];
} else {
    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao adicionar evento aos favoritos', 'data' => []];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);