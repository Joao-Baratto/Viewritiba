<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['participante_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Faça login como participante para ver o perfil.',
        'data' => []
    ]);
    exit;
}

include_once('conexao.php');
$id_participante = (int) $_SESSION['participante_id'];
require_once __DIR__ . '/../../crud_admin/php/banimentos.php';
exigir_conta_nao_banida($conexao, 'participante', $id_participante);
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];
$stmt = $conexao->prepare("SELECT id, nome, documento, email, telefone FROM participante WHERE id = ?");
$stmt->bind_param("i", $id_participante);
$stmt->execute();
$resultado = $stmt->get_result();
if ($resultado->num_rows > 0) {
    $participante = $resultado->fetch_assoc();

    // busca os eventos favoritados pelo participante
    $stmt_favorito = $conexao->prepare(
        "SELECT evento.* FROM evento
         INNER JOIN favorito ON favorito.id_evento = evento.id_evento
         WHERE favorito.tipo_conta = 'participante' AND favorito.id_usuario = ?
         ORDER BY evento.data_hora DESC"
    );
    $stmt_favorito->bind_param("i", $id_participante);
    $stmt_favorito->execute();
    $resultado_favorito = $stmt_favorito->get_result();
    $favoritos = [];
    while ($linha = $resultado_favorito->fetch_assoc()) {
        $favoritos[] = $linha;
    }
    $stmt_favorito->close();
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Sucesso, consulta efetuada.',
        'data' => [
            'participante' => $participante,
            'favoritos' => $favoritos
        ]
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Participante não encontrado.',
        'data' => []
    ];
}
$stmt->close();
$conexao->close();
echo json_encode($retorno);
