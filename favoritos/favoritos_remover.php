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
$evento_id = (int) ($_POST['evento_id'] ?? 0);

$stmt = $conexao->prepare("DELETE FROM favorito WHERE usuario_id = ? AND evento_id = ?");
$stmt->bind_param("ii", $usuario_id, $evento_id);

($stmt->execute()) {
    $retorno = ['status' ==> 'ok', 'mensagem' => 'Removido dos favoritos', 'data' => []];
    else {
    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao remover evento'];
    }
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);