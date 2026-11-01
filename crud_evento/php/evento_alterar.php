<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['organizador_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Faça login como organizador para alterar eventos.',
        'data' => []
    ]);
    exit;
}

$id = (int) ($_GET['id'] ?? 0);
$titulo = trim($_POST['titulo'] ?? '');
$descricao = trim($_POST['descricao'] ?? '');
$data_hora = trim($_POST['data_hora'] ?? '');
$local = trim($_POST['local'] ?? '');
$categorias = $_POST['categorias'] ?? [];

if ($id < 1 || $titulo === '' || $descricao === '' || $data_hora === '' || $local === '' || count($categorias) == 0) {
    http_response_code(400);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Informe um evento válido, preencha todos os campos e selecione pelo menos uma categoria.',
        'data' => []
    ]);
    exit;
}

$data_hora = str_replace('T', ' ', $data_hora);
if (strlen($data_hora) === 16) {
    $data_hora .= ':00';
}

include_once('conexao.php');

$id_organizador = (int) $_SESSION['organizador_id'];
require_once __DIR__ . '/../../crud_admin/php/banimentos.php';
exigir_conta_nao_banida($conexao, 'organizador', $id_organizador);

// confere se o evento é do organizador antes de alterar
$stmt = $conexao->prepare("SELECT id FROM evento WHERE id = ? AND id_organizador = ?");
$stmt->bind_param("ii", $id, $id_organizador);
$stmt->execute();
$encontrado = $stmt->get_result()->num_rows > 0;
$stmt->close();

if (!$encontrado) {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'O evento não foi encontrado.',
        'data' => []
    ]);
    $conexao->close();
    exit;
}

$stmt = $conexao->prepare("
    UPDATE evento
    SET titulo = ?, descricao = ?, data_hora = ?, local = ?
    WHERE id = ? AND id_organizador = ?
");
$stmt->bind_param("ssssii", $titulo, $descricao, $data_hora, $local, $id, $id_organizador);
$stmt->execute();
$stmt->close();

// apaga as categorias antigas do evento e grava as selecionadas
$stmt_categoria = $conexao->prepare("DELETE FROM evento_categoria WHERE id_evento = ?");
$stmt_categoria->bind_param("i", $id);
$stmt_categoria->execute();
$stmt_categoria->close();
$stmt_categoria = $conexao->prepare("INSERT INTO evento_categoria (id_evento, id_categoria) VALUES (?, ?)");
foreach ($categorias as $id_categoria) {
    $id_categoria = (int) $id_categoria;
    $stmt_categoria->bind_param("ii", $id, $id_categoria);
    $stmt_categoria->execute();
}
$stmt_categoria->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Evento alterado com sucesso.',
    'data' => []
];

$conexao->close();
echo json_encode($retorno);
