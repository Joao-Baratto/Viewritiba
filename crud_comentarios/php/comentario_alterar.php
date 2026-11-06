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

if($usuario['tipo'] !== 'participante'){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Organizadores só podem visualizar os comentários.',
        'data' => []
    ]);
    exit;
}

$id_comentario = (int)($_POST['id_comentario'] ?? $_GET['id_comentario'] ?? '');
$texto = trim(($_POST['texto'] ?? ''));
$nota = (int)($_POST['nota'] ??'');

if(!$id_comentario || !$texto || !$nota){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Voce deve preencher todos os campos.',
        'data' => []
    ]);
    exit;
}

$stmt_existe = $conexao->prepare("SELECT id_comentario FROM avaliacao_comentario WHERE id_comentario = ? AND tipo_conta = ? AND id_usuario = ?");
if(!$stmt_existe){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Erro ao consultar comentário: ' . $conexao->error,
        'data' => []
    ]);
    exit;
}

$stmt_existe->bind_param("isi", $id_comentario, $usuario['tipo'], $usuario['id']);
$stmt_existe->execute();
if($stmt_existe->get_result()->num_rows == 0){
    $stmt_existe->close();
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Voce não pode alterar este comentário.',
        'data' => []
    ]);
    exit;
}
$stmt_existe->close();

$stmt = $conexao->prepare("UPDATE avaliacao_comentario SET texto = ?, nota = ? WHERE id_comentario = ?");
if(!$stmt){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'Erro ao preparar alteração: ' . $conexao->error,
        'data' => []
    ]);
    exit;
}

$stmt->bind_param("sii", $texto, $nota, $id_comentario);
$stmt->execute();

$retorno = [
    'status' => 'ok',
    'mensagem_retorno' => 'Comentário alterado com sucesso.',
    'data' => []
];

echo json_encode($retorno);
$stmt->close();
$conexao->close();
?>
