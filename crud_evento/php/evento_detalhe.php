<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

$id = (int) ($_GET['id'] ?? 0);
if ($id < 1) {
    http_response_code(400);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Informe um evento válido.',
        'data' => []
    ]);
    exit;
}

include_once('conexao.php');
$id_participante = (int) ($_SESSION['participante_id'] ?? 0);
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$stmt = $conexao->prepare(
    "SELECT evento.*, organizador.nome AS organizador,
            (SELECT GROUP_CONCAT(nome_categoria ORDER BY nome_categoria SEPARATOR ', ')
               FROM evento_categoria
              INNER JOIN categoria ON categoria.id_categoria = evento_categoria.id_categoria
              WHERE id_evento = evento.id_evento) AS categorias,
            (SELECT COUNT(*) FROM favorito
              WHERE id_evento = evento.id_evento AND tipo_conta = 'participante'
                AND id_usuario = ?) AS favoritado
     FROM evento
     LEFT JOIN organizador ON organizador.id = evento.id_organizador
     WHERE evento.id_evento = ?"
);
$stmt->bind_param("ii", $id_participante, $id);
$stmt->execute();
$linha = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conexao->close();

if ($linha) {
    $linha['favoritado'] = $linha['favoritado'] > 0;
    $linha['pode_favoritar'] = $id_participante > 0;
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Sucesso, consulta efetuada.',
        'data' => $linha
    ];
} else {
    http_response_code(404);
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Evento não encontrado.',
        'data' => []
    ];
}
echo json_encode($retorno);
