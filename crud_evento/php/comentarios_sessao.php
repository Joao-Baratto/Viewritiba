<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['participante_id'])) {
    echo json_encode(['status' => 'ok', 'autenticado' => false]);
    exit;
}

require_once __DIR__ . '/conexao.php';
require_once __DIR__ . '/../../crud_admin/php/banimentos.php';
exigir_conta_nao_banida($conexao, 'participante', (int) $_SESSION['participante_id']);

echo json_encode([
    'status' => 'ok',
    'autenticado' => true,
    'nome' => $_SESSION['participante_nome']
]);

$conexao->close();
