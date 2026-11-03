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
$stmt = $conexao->prepare(
    "SELECT id_comentario AS id, texto, nota, data_criacao, id_usuario, id_evento
     FROM avaliacao_comentario WHERE id_comentario = ? AND tipo_conta = ? AND id_usuario = ?"
);
$stmt->bind_param("isi", $id_comentario, $usuario['tipo'], $usuario['id']);
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
        'mensagem_retorno' => 'Voce não pode visualizar este comentário.',
        'data' => []
    ];
}

echo json_encode($retorno);
$stmt->close();
$conexao->close();
?>
