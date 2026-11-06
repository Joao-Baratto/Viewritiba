<?php
session_start();
include_once('conexao.php');
include_once('../../php/usuario_logado.php');
header("Content-type:application/json;charset:utf-8");

$usuario = usuario_logado();
if($usuario === null){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Faça login para continuar.',
        'data' => []
    ]);
    exit;
}

$id_comentario = filter_input(INPUT_GET, 'id_comentario', FILTER_VALIDATE_INT);
if(!$id_comentario){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Comentário inválido.',
        'data' => []
    ]);
    exit;
}

$stmt = $conexao->prepare("DELETE FROM avaliacao_comentario WHERE id_comentario = ? AND tipo_conta = ? AND id_usuario = ?");
if(!$stmt){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Erro ao preparar exclusão: ' . $conexao->error,
        'data' => []
    ]);
    exit;
}

$stmt->bind_param("isi", $id_comentario, $usuario['tipo'], $usuario['id']);
$stmt->execute();

if($stmt->affected_rows > 0){
    $retorno = [
        'status' => 'ok',
        'mensagem_retorno' => 'Comentário excluído com sucesso.',
        'data' => []
    ];
}else{
    $retorno = [
        'status' => 'nok',
        'mensagem_retorno' => 'Voce não pode excluir este comentário.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
?>
