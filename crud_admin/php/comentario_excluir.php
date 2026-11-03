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
    echo json_encode(['status' => 'erro', 'mensagem' => 'Informe um comentário válido.']);
    exit;
}

require_once __DIR__ . '/conexao.php';
$stmt = $conexao->prepare('DELETE FROM comentario WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();

if ($stmt->affected_rows === 0) {
    http_response_code(404);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Comentário não encontrado.']);
} else {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Comentário excluído.']);
}

$stmt->close();
$conexao->close();
