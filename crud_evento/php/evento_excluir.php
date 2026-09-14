<?php
include_once('conexao.php');
header("Content-type:application/json;charset:utf-8");

$id_evento = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if(!$id_evento){
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'É necessário informar um ID para exclusão.',
        'data' => []
    ]);
    exit;
}

$stmt = $conexao->prepare("DELETE FROM avaliacao_comentario WHERE id_evento = ?");
$stmt->bind_param("i", $id_evento);
$stmt->execute();
$stmt->close();

$stmt = $conexao->prepare("DELETE FROM evento_categoria WHERE id_evento = ?");
$stmt->bind_param("i", $id_evento);
$stmt->execute();
$stmt->close();

$stmt = $conexao->prepare("DELETE FROM favorito WHERE id_evento = ?");
$stmt->bind_param("i", $id_evento);
$stmt->execute();
$stmt->close();

$stmt = $conexao->prepare("DELETE FROM evento WHERE id_evento = ?");
$stmt->bind_param("i", $id_evento);
$stmt->execute();

$retorno = $stmt->affected_rows > 0
    ? ['status' => 'ok', 'mensagem' => 'Registro excluído.', 'data' => []]
    : ['status' => 'nok', 'mensagem' => 'Registro não encontrado.', 'data' => []];

$stmt->close();
$conexao->close();
echo json_encode($retorno);
?>