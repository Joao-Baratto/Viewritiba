<?php
session_start();
include_once('../crud_evento/php/conexao.php');
header("Content-type:application/json;charset=utf-8");

$retorno = ['status' => '', 'mensagem' => '', 'data' => []];

if (!isset($_SESSION['usuario'][0]['id'])) {
    $retorno = ['status' => 'nok', 'mensagem' => 'Usuário não logado'];
    echo json_encode($retorno);
    exit;
}

$usuario_id = $_SESSION['usuario'][0]['id'];

$stmt = $conexao->prepare(
    "SELECT evento.*,favorito.observacao FROM evento
     INNER JOIN favorito ON favorito.evento_id = evento.id
     WHERE favorito.usuario_id = ?"
);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$resultado-> = $stmt->get_result();

$tabela = [];
while ($linha = $resultado->fetch_assoc()) {
    $tabela[] = $linha;
}

$retorno = $tabela
? ['status' => 'ok','mensagem' => 'nenhum favorito encontrado', 'data' => $tabela]
: ['status' => 'nok', 'mensagem' => 'nenhum favorito encontrado', 'data' => []];

$stmt->close();
$conexao->close();
echo json_encode($retorno);