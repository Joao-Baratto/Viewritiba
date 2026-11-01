<?php
require_once __DIR__ . '/proteger_admin.php';
exigir_moderador(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido.']);
    exit;
}

$tipo = $_POST['tipo_conta'] ?? '';
$id = filter_input(INPUT_POST, 'id_conta', FILTER_VALIDATE_INT);

if (!in_array($tipo, ['organizador', 'participante'], true) || !$id || $id < 1) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Selecione uma conta válida.']);
    exit;
}

require_once __DIR__ . '/conexao.php';
$stmt = $conexao->prepare(
    'DELETE FROM conta_banimento WHERE tipo_conta = ? AND id_conta = ?'
);
$stmt->bind_param('si', $tipo, $id);
$stmt->execute();

if ($stmt->affected_rows === 0) {
    http_response_code(404);
    echo json_encode(['status' => 'erro', 'mensagem' => 'A conta não estava suspensa.']);
} else {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Suspensão removida.']);
}

$stmt->close();
$conexao->close();
