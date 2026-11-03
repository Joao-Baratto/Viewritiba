<?php
session_start();
include_once('../crud_evento/php/conexao.php');
include_once('../php/usuario_logado.php');
header("Content-type:application/json;charset=utf-8");

$retorno = ['status' => '', 'mensagem' => '', 'data' => []];

$usuario = usuario_logado();
if ($usuario == null) {
    $retorno = ['status' => 'nok', 'mensagem' => 'Usuário não logado', 'data' => []];
    echo json_encode($retorno);
    exit;
}

$tipo_conta = $usuario['tipo'];
$id_usuario = $usuario['id'];
$id_evento = (int) ($_POST['evento_id'] ?? 0);

$stmt = $conexao->prepare("DELETE FROM favorito WHERE tipo_conta = ? AND id_usuario = ? AND id_evento = ?");
$stmt->bind_param("sii", $tipo_conta, $id_usuario, $id_evento);

if ($stmt->execute()) {
    $retorno = ['status' => 'ok', 'mensagem' => 'Removido dos favoritos', 'data' => []];
} else {
    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao remover evento', 'data' => []];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);