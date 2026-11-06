<?php
include_once('conexao.php');
header("Content-type:application/json;charset:utf-8");

$id_evento = (int)($_GET['id_evento'] ?? '');
if(!$id_evento){
    echo json_encode([
        'status' => 'nok',
        'mensagem_retorno' => 'ID do evento inválido.',
        'data' => []
    ]);
    exit;
}

$stmt = $conexao->prepare(
    "SELECT avaliacao_comentario.id_comentario AS id, avaliacao_comentario.texto, avaliacao_comentario.nota,
            avaliacao_comentario.data_criacao, avaliacao_comentario.id_usuario, avaliacao_comentario.id_evento,
            participante.nome AS usuario FROM avaliacao_comentario
     INNER JOIN participante ON participante.id = avaliacao_comentario.id_usuario
     WHERE avaliacao_comentario.tipo_conta = 'participante' AND avaliacao_comentario.id_evento = ?
     ORDER BY avaliacao_comentario.id_comentario DESC"
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
