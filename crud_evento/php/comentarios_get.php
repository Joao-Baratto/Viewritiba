<?php
header('Content-Type: application/json; charset=utf-8');

$id_evento = filter_input(INPUT_GET, 'id_evento', FILTER_VALIDATE_INT);
if (!$id_evento || $id_evento < 1) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Informe um evento válido.']);
    exit;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
require_once __DIR__ . '/conexao.php';
$stmt = $conexao->prepare(
    'SELECT id, usuario, comentario, data FROM comentario
     WHERE id_evento = ? ORDER BY data DESC'
);
$stmt->bind_param('i', $id_evento);
$stmt->execute();
$resultado = $stmt->get_result();

$comentarios = [];
while ($comentario = $resultado->fetch_assoc()) {
    $comentarios[] = $comentario;
}

echo json_encode(['status' => 'ok', 'data' => $comentarios]);

$stmt->close();
$conexao->close();
