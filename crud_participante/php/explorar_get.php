<?php
session_start();
date_default_timezone_set('America/Sao_Paulo');
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['participante_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Faça login como participante para consultar os eventos.',
        'data' => []
    ]);
    exit;
}

include_once('conexao.php');
include_once('../../crud_admin/php/banimentos.php');
$id_participante = (int) $_SESSION['participante_id'];
exigir_conta_nao_banida($conexao, 'participante', $id_participante);
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$stmt = $conexao->prepare(
    "SELECT evento_categoria.id_categoria, COUNT(*) AS vezes FROM favorito
     INNER JOIN evento_categoria ON evento_categoria.id_evento = favorito.id_evento
     WHERE favorito.tipo_conta = 'participante' AND favorito.id_usuario = ?
     GROUP BY evento_categoria.id_categoria"
);
$stmt->bind_param("i", $id_participante);
$stmt->execute();
$favoritas = array_column($stmt->get_result()->fetch_all(MYSQLI_ASSOC), 'vezes', 'id_categoria');
$stmt->close();
$total_favoritadas = array_sum($favoritas);

$stmt = $conexao->prepare(
    "SELECT evento.*, organizador.nome AS organizador,
            (SELECT GROUP_CONCAT(id_categoria) FROM evento_categoria
              WHERE id_evento = evento.id_evento) AS categorias,
            (SELECT AVG(nota) FROM avaliacao_comentario
              WHERE id_evento = evento.id_evento) AS nota_media,
            (SELECT COUNT(*) FROM avaliacao_comentario
              WHERE id_evento = evento.id_evento) AS qtd_avaliacoes,
            (SELECT COUNT(*) FROM favorito
              WHERE id_evento = evento.id_evento AND tipo_conta = 'participante'
                AND id_usuario = ?) AS favoritado
     FROM evento
     LEFT JOIN organizador ON organizador.id = evento.id_organizador
     ORDER BY evento.data_hora"
);
$stmt->bind_param("i", $id_participante);
$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
$agora = new DateTime();
while ($linha = $resultado->fetch_assoc()) {
    $data = new DateTime($linha['data_hora']);
    if ($data < $agora) {
        continue;
    }

    $categorias = $linha['categorias'] ? explode(',', $linha['categorias']) : [];
    $em_comum = array_intersect($categorias, array_keys($favoritas));
    if (count($em_comum) == 0) {
        continue;
    }

    $afinidade = 0;
    foreach ($em_comum as $id_categoria) {
        $afinidade += $favoritas[$id_categoria] / $total_favoritadas;
    }
    $nota = (3 * 3 + $linha['nota_media'] * $linha['qtd_avaliacoes'])
          / (3 + $linha['qtd_avaliacoes']) / 5;
    $proximidade = 1 / (1 + $agora->diff($data)->days / 30);

    $linha['pontuacao'] = 0.5 * $afinidade + 0.3 * $nota + 0.2 * $proximidade;
    $linha['favoritado'] = $linha['favoritado'] > 0;
    $linha['nota_media'] = $linha['nota_media'] === null ? null : round($linha['nota_media'], 1);
    unset($linha['categorias']);
    $tabela[] = $linha;
}
$stmt->close();
$conexao->close();

$pontuacoes = array_column($tabela, 'pontuacao');
array_multisort($pontuacoes, SORT_DESC, $tabela);

if (count($tabela) > 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Sucesso, consulta efetuada.',
        'data' => $tabela
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não há registros',
        'data' => []
    ];
}
echo json_encode($retorno);
