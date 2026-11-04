<?php
require_once __DIR__ . '/proteger_admin.php';
exigir_moderador(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Método não permitido.', 'data' => []]);
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
if ($id < 1) {
    http_response_code(400);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Informe uma categoria válida.', 'data' => []]);
    exit;
}

require_once __DIR__ . '/conexao.php';

$stmt = $conexao->prepare('SELECT id_evento FROM evento_categoria WHERE id_categoria = ? LIMIT 1');
$stmt->bind_param('i', $id);
$stmt->execute();
$em_uso = $stmt->get_result()->num_rows > 0;
$stmt->close();

if ($em_uso) {
    http_response_code(409);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Categoria em uso. Remova-a dos eventos antes de excluir.',
        'data' => []
    ]);
    $conexao->close();
    exit;
}

$stmt = $conexao->prepare('DELETE FROM categoria WHERE id_categoria = ?');
$stmt->bind_param('i', $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $retorno = ['status' => 'ok', 'mensagem' => 'Categoria excluída.', 'data' => []];
} else {
    http_response_code(404);
    $retorno = ['status' => 'nok', 'mensagem' => 'Categoria não encontrada.', 'data' => []];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
