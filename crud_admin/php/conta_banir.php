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
$motivo = trim($_POST['motivo'] ?? '');
$motivo_caracteres = preg_match_all('/./us', $motivo);

if (
    !in_array($tipo, ['organizador', 'participante'], true)
    || !$id
    || $id < 1
    || $motivo === ''
    || $motivo_caracteres === false
    || $motivo_caracteres > 2000
) {
    http_response_code(400);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Selecione uma conta e informe um motivo de até 2000 caracteres.'
    ]);
    exit;
}

require_once __DIR__ . '/conexao.php';
$tabela = $tipo === 'organizador' ? 'organizador' : 'participante';
$stmt_conta = $conexao->prepare("SELECT id FROM {$tabela} WHERE id = ?");
$stmt_conta->bind_param('i', $id);
$stmt_conta->execute();
$conta = $stmt_conta->get_result()->fetch_assoc();
$stmt_conta->close();

if (!$conta) {
    http_response_code(404);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Conta não encontrada.']);
    $conexao->close();
    exit;
}

$stmt = $conexao->prepare(
    'INSERT INTO conta_banimento (tipo_conta, id_conta, motivo)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE motivo = VALUES(motivo), banido_em = CURRENT_TIMESTAMP'
);
$stmt->bind_param('sis', $tipo, $id, $motivo);
$stmt->execute();

echo json_encode([
    'status' => 'ok',
    'mensagem' => 'Conta suspensa. O titular verá o motivo ao tentar entrar.'
]);

$stmt->close();
$conexao->close();
