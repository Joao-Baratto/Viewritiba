<?php
include_once('conexao.php');
header("Content-type:application/json;charset:utf-8");

$id_comentario = filter_input(INPUT_GET, 'id_comentario', FILTER_VALIDATE_INT);
if(!$id_comentario){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Comentário inválido.',
        'data' => []
    ]);
    exit;
}

$stmt = $conexao->prepare("DELETE FROM avaliacao_comentario WHERE id_comentario = ?");
if(!$stmt){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Erro ao preparar exclusão: ' . $conexao->error,
        'data' => []
    ]);
    exit;
}

$stmt->bind_param("i", $id_comentario);
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
        'mensagem_retorno' => 'Comentário inválido.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
?>
