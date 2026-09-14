<?php
session_start();
include_once('conexao.php');
header("Content-type:application/json;charset:utf-8");

function responder($status, $mensagem, $data = []) {
    echo json_encode([
        'status' => $status,
        'mensagem_retorno' => $mensagem,
        'data' => $data
    ]);
    exit;
}

$texto = trim($_POST['texto'] ?? '');
$id_evento = filter_input(INPUT_POST, 'id_evento', FILTER_VALIDATE_INT);
$nota = filter_input(INPUT_POST, 'nota', FILTER_VALIDATE_INT);
$email = '';
if(isset($_SESSION['usuario'][0]['email'])){
    $email = $_SESSION['usuario'][0]['email'];
}

if($texto === '' || !$id_evento || $nota === false || $nota < 1 || $nota > 5 || $email === ''){
    responder('nok', 'É necessário estar logado e informar texto, id_evento e nota de 1 a 5.');
}

$stmt_usuario = $conexao->prepare("SELECT id_usuario FROM usuario WHERE email = ?");
if(!$stmt_usuario){
    responder('nok', 'Erro ao consultar usuário: ' . $conexao->error);
}
$stmt_usuario->bind_param("s", $email);
$stmt_usuario->execute();
$resultado_usuario = $stmt_usuario->get_result();

if($resultado_usuario->num_rows === 0){
    $stmt_usuario->close();
    responder('nok', 'Usuário não encontrado no sistema.');
}

$id_usuario = (int) $resultado_usuario->fetch_assoc()['id_usuario'];
$stmt_usuario->close();

$stmt_evento = $conexao->prepare("SELECT id_evento FROM evento WHERE id_evento = ?");
if(!$stmt_evento){
    responder('nok', 'Erro ao consultar evento: ' . $conexao->error);
}
$stmt_evento->bind_param("i", $id_evento);
$stmt_evento->execute();
$resultado_evento = $stmt_evento->get_result();

if($resultado_evento->num_rows === 0){
    $stmt_evento->close();
    responder('nok', 'Evento não encontrado.');
}
$stmt_evento->close();

$stmt = $conexao->prepare(
    "INSERT INTO avaliacao_comentario (texto, nota, data_criacao, id_usuario, id_evento)
     VALUES (?, ?, NOW(), ?, ?)"
);
if(!$stmt){
    responder('nok', 'Erro ao preparar comentário: ' . $conexao->error);
}

$stmt->bind_param("siii", $texto, $nota, $id_usuario, $id_evento);
if(!$stmt->execute()){
    $erro = $stmt->error;
    $stmt->close();
    responder('nok', 'Erro ao adicionar comentário: ' . $erro);
}

$id_comentario = $stmt->insert_id;
$stmt->close();
$conexao->close();

responder('ok', 'Comentário adicionado com sucesso.', ['insert_id' => $id_comentario]);
?>
