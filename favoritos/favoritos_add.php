<?php
session_start();
include_once('../crud_evento/php/conexao.php');
include_once('../php/usuario_logado.php');
header("Content-type:application/json;charset=utf-8");

$retorno = ['status' => '', 'mensagem' => '', 'data' => []];

$usuario = usuario_logado();
if ($usuario == null || $usuario['tipo'] != 'participante') {
    $retorno = ['status' => 'nok', 'mensagem' => 'Apenas participantes podem favoritar eventos.', 'data' => []];
    echo json_encode($retorno);
    exit;
}

$tipo_conta = $usuario['tipo'];
$id_usuario = $usuario['id'];
$id_evento = (int) ($_POST['evento_id'] ?? 0);

// Evento que já aconteceu não pode ser favoritado
$stmt = $conexao->prepare("SELECT data_hora < NOW() AS encerrado FROM evento WHERE id_evento = ?");
$stmt->bind_param("i", $id_evento);
$stmt->execute();
$evento = $stmt->get_result()->fetch_assoc();
$stmt->close();
if (!$evento || (int) $evento['encerrado'] === 1) {
    $conexao->close();
    echo json_encode([
        'status' => 'nok',
        'mensagem' => $evento ? 'Este evento já aconteceu e não pode ser favoritado.' : 'Evento não encontrado.',
        'data' => []
    ]);
    exit;
}

$observacao = '';
$stmt = $conexao->prepare("INSERT INTO favorito (tipo_conta, id_usuario, id_evento, observacao) VALUES (?, ?, ?, ?)");
$stmt->bind_param("siis", $tipo_conta, $id_usuario, $id_evento, $observacao);

if ($stmt->execute()) {
    $retorno = ['status' => 'ok', 'mensagem' => 'Evento adicionado aos favoritos com sucesso!', 'data' => []];
} else {
    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao adicionar evento aos favoritos', 'data' => []];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);