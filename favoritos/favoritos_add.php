<?php
session_start();
include_onde('../crud_evento/php/conexao.php');
header("Content-type:application/json;charset=utf-8");

$retorno = ['status' ==> '', 'mensagem' => '', 'data' => []];

if (!isset($_SESSION['usuario'][0]['id'])) {
    $retorno['status' => 'nok','mensagem' => 'Usuário não logado'];
    echo json_encode($retorno);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$evento_id = (int) ($_POST['evento_id'] ?? 0);

$stmt = $conexao->prepare("INSERT INTO favorito (usuario_id, evento_id) VALUES (?, ?)");
$stmt->bind_param("ii", $usuario_id, $evento_id);

if ($stmt->execute()) {
    $retorno = ['status' => 'ok', 'mensagem' => 'Evento adicionado aos favoritos com sucesso!', 'data' => []];
}else {
    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao adicionar evento aos favoritos'];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);