<?php
include_once('conexao.php');
header("Content-type:application/json;charset:utf-8");

$id_evento = filter_input(INPUT_GET, 'id_evento', FILTER_VALIDATE_INT);
if(!$id_evento){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'ID do evento inválido.',
        'data' => []
    ]);
    exit;
}

$stmt = $conexao->prepare(
    "SELECT c.id_comentario AS id, c.texto, c.nota, c.data_criacao, c.id_usuario, c.id_evento, u.nome AS nome_usuario
     FROM avaliacao_comentario c INNER JOIN usuario u ON c.id_usuario = u.id_usuario
     WHERE c.id_evento = ? ORDER BY c.id_comentario DESC"
);
$stmt->bind_param("i", $id_evento);
$stmt->execute();
$resultado = $stmt->get_result();
$comentarios = $resultado->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'status' => count($comentarios) > 0 ? 'ok' : 'nok',
    'mensagem_retorno' => count($comentarios) > 0 ? 'Sucesso, consulta efetuada.' : 'Não há registros',
    'data' => $comentarios
]);

$stmt->close();
$conexao->close();
?>
