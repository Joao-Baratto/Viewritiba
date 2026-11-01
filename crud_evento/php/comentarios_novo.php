<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido.']);
    exit;
}

if (!isset($_SESSION['participante_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Entre como participante para publicar um comentário.'
    ]);
    exit;
}

$id_evento = filter_input(INPUT_POST, 'id_evento', FILTER_VALIDATE_INT);
$texto = trim($_POST['comentario'] ?? '');

if (!$id_evento || $id_evento < 1 || $texto === '' || strlen($texto) > 4000) {
    http_response_code(400);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Informe um evento válido e um comentário de até 1000 caracteres.'
    ]);
    exit;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
require_once __DIR__ . '/conexao.php';
require_once __DIR__ . '/../../crud_admin/php/banimentos.php';
exigir_conta_nao_banida($conexao, 'participante', (int) $_SESSION['participante_id']);

$stmt_evento = $conexao->prepare('SELECT id FROM evento WHERE id = ?');
$stmt_evento->bind_param('i', $id_evento);
$stmt_evento->execute();
$evento = $stmt_evento->get_result()->fetch_assoc();
$stmt_evento->close();

if (!$evento) {
    http_response_code(404);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Evento não encontrado.']);
    $conexao->close();
    exit;
}

$usuario = $_SESSION['participante_nome'];
$stmt = $conexao->prepare(
    'INSERT INTO comentario (id_evento, usuario, comentario) VALUES (?, ?, ?)'
);
$stmt->bind_param('iss', $id_evento, $usuario, $texto);
$stmt->execute();

echo json_encode(['status' => 'ok', 'mensagem' => 'Comentário publicado.']);

$stmt->close();
$conexao->close();
