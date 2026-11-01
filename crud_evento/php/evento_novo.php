<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['organizador_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Faça login como organizador para cadastrar eventos.',
        'data' => []
    ]);
    exit;
}

$titulo = trim($_POST['titulo'] ?? '');
$descricao = trim($_POST['descricao'] ?? '');
$data_hora = trim($_POST['data_hora'] ?? '');
$local = trim($_POST['local'] ?? '');
$categorias = $_POST['categorias'] ?? [];

if ($titulo === '' || $descricao === '' || $data_hora === '' || $local === '') {
    http_response_code(400);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Preencha todos os campos do evento.',
        'data' => []
    ]);
    exit;
}

if (count($categorias) == 0) {
    http_response_code(400);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Selecione pelo menos uma categoria.',
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
$stmt = $conexao->prepare("
    INSERT INTO evento (titulo, descricao, data_hora, local, id_organizador)
    VALUES (?, ?, ?, ?, ?)
");
$stmt->bind_param("ssssi", $titulo, $descricao, $data_hora, $local, $id_organizador);
$stmt->execute();
$id_evento = $stmt->insert_id;
$stmt->close();

$stmt = $conexao->prepare("INSERT INTO evento_categoria (id_evento, id_categoria) VALUES (?, ?)");
foreach ($categorias as $id_categoria) {
    $id_categoria = (int) $id_categoria;
    $stmt->bind_param("ii", $id_evento, $id_categoria);
    $stmt->execute();
}
$stmt->close();

echo json_encode([
    'status' => 'ok',
    'mensagem' => 'Evento cadastrado com sucesso.',
    'data' => ['id' => $id_evento]
]);

$conexao->close();
