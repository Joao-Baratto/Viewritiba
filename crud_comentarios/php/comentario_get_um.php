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
$stmt = $conexao->prepare(
    "SELECT id_comentario AS id, texto, nota, data_criacao, id_usuario, id_evento
     FROM avaliacao_comentario WHERE id_comentario = ?"
);
$stmt->bind_param("i", $id_comentario);
$stmt->execute();
$registro = $stmt->get_result()->fetch_assoc();

if($registro){
    $retorno = [
        'status' => 'ok',
        'mensagem_retorno' => 'Comentário carregado com sucesso.',
        'data' => [$registro]
    ];
}else{
    $retorno = [
        'status' => 'nok',
        'mensagem_retorno' => 'Comentário não encontrado.',
        'data' => []
    ];
}

echo json_encode($retorno);
$stmt->close();
$conexao->close();
?>
