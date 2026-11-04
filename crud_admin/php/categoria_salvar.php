<?php
require_once __DIR__ . '/proteger_admin.php';
exigir_moderador(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Método não permitido.', 'data' => []]);
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
$nome = trim($_POST['nome'] ?? '');

if ($nome === '' || mb_strlen($nome, 'UTF-8') > 50) {
    http_response_code(400);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Informe o nome da categoria com até 50 caracteres.', 'data' => []]);
    exit;
}

require_once __DIR__ . '/conexao.php';

$stmt = $conexao->prepare('SELECT id_categoria FROM categoria WHERE nome_categoria = ? AND id_categoria <> ?');
$stmt->bind_param('si', $nome, $id);
$stmt->execute();
$existe = $stmt->get_result()->num_rows > 0;
$stmt->close();

if ($existe) {
    http_response_code(409);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Já existe uma categoria com esse nome.', 'data' => []]);
    $conexao->close();
    exit;
}

if ($id > 0) {
    $stmt = $conexao->prepare('UPDATE categoria SET nome_categoria = ? WHERE id_categoria = ?');
    $stmt->bind_param('si', $nome, $id);
    $mensagem = 'Categoria atualizada.';
} else {
    $stmt = $conexao->prepare('INSERT INTO categoria (nome_categoria) VALUES (?)');
    $stmt->bind_param('s', $nome);
    $mensagem = 'Categoria criada.';
}
$stmt->execute();

$stmt->close();
$conexao->close();
echo json_encode(['status' => 'ok', 'mensagem' => $mensagem, 'data' => []]);
