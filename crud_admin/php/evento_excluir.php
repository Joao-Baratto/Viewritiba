<?php
require_once __DIR__ . '/proteger_admin.php';
exigir_moderador(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido.']);
    exit;
}

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id || $id < 1) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Informe um evento válido.']);
    exit;
}

require_once __DIR__ . '/conexao.php';
$conexao->begin_transaction();

$stmt_comentarios = $conexao->prepare('DELETE FROM comentario WHERE id_evento = ?');
$stmt_comentarios->bind_param('i', $id);
$stmt_comentarios->execute();
$stmt_comentarios->close();

$stmt_evento = $conexao->prepare('DELETE FROM evento WHERE id = ?');
$stmt_evento->bind_param('i', $id);
$stmt_evento->execute();

if ($stmt_evento->affected_rows === 0) {
    $conexao->rollback();
    http_response_code(404);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Evento não encontrado.']);
} else {
    $conexao->commit();
    echo json_encode([
        'status' => 'ok',
        'mensagem' => 'Evento e seus comentários foram excluídos.'
    ]);
}

$stmt_evento->close();
$conexao->close();
