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

$stmt = $conexao->prepare(
    "SELECT evento.*, favorito.observacao FROM evento
     INNER JOIN favorito ON favorito.id_evento = evento.id_evento
     WHERE favorito.id_usuario = ?"
);

if (!$stmt) {
    die("Erro no prepare: " . $conexao->error);
}
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
while ($linha = $resultado->fetch_assoc()) {
    $tabela[] = $linha;
}

$retorno = $tabela
    ? ['status' => 'ok', 'mensagem' => 'Sucesso', 'data' => $tabela]
    : ['status' => 'nok', 'mensagem' => 'Nenhum favorito encontrado', 'data' => []];

$stmt->close();
$conexao->close();
echo json_encode($retorno);