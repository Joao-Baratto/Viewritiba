<?php
session_start();
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

require_once __DIR__ . '/../../crud_admin/php/banimentos.php';

$id_participante = (int) $_SESSION['participante_id'];

exigir_conta_nao_banida($conexao, 'participante', $id_participante);
$sql = "SELECT evento.*, evento.id_evento AS id, organizador.nome AS organizador,
               (SELECT GROUP_CONCAT(DISTINCT evento_categoria.categoria
                                    ORDER BY evento_categoria.categoria SEPARATOR ', ')
                  FROM evento_categoria
                 WHERE evento_categoria.id_evento = evento.id_evento) AS categorias,
               (SELECT COUNT(*) FROM favorito
                 WHERE id_evento = evento.id_evento
                   AND id_usuario = ?) AS favoritado
        FROM evento
        LEFT JOIN organizador ON organizador.id = evento.id_organizador";

$filtros = [];
$parametros = [$id_participante];
$tipos = "i";

if (isset($_GET['titulo']) && trim($_GET['titulo']) !== '') {
    $busca = "%" . trim($_GET['titulo']) . "%";

    $filtros[] = '(evento.titulo LIKE ?
                   OR evento.descricao LIKE ?
                   OR evento.`local` LIKE ?
                   OR organizador.nome LIKE ?)';

    $parametros[] = $busca;
    $parametros[] = $busca;
    $parametros[] = $busca;
    $parametros[] = $busca;
    $tipos .= "ssss";
}

if (isset($_GET['categoria']) && trim($_GET['categoria']) !== '') {
    $filtros[] = "EXISTS (
        SELECT 1
        FROM evento_categoria
        WHERE evento_categoria.id_evento = evento.id_evento
          AND evento_categoria.categoria = ?
    )";

    $parametros[] = trim($_GET['categoria']);
    $tipos .= "s";
}

if ($filtros) {
    $sql .= " WHERE " . implode(" AND ", $filtros);
}

$stmt = $conexao->prepare($sql);

if (!$stmt) {
    error_log("Erro ao preparar consulta de eventos do participante: " . $conexao->error);
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Não foi possível carregar os eventos.',
        'data' => []
    ]);
    $conexao->close();
    exit;
}

$parametrosReferenciados = [];

foreach ($parametros as $indice => &$parametro) {
    $parametrosReferenciados[$indice] = &$parametro;
}

array_unshift($parametrosReferenciados, $tipos);
call_user_func_array([$stmt, 'bind_param'], $parametrosReferenciados);

if (!$stmt->execute()) {
    error_log("Erro ao consultar eventos do participante: " . $stmt->error);
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Não foi possível consultar os eventos.',
        'data' => []
    ]);
    $stmt->close();
    $conexao->close();
    exit;
}

$resultado = $stmt->get_result();
$tabela = [];

while ($linha = $resultado->fetch_assoc()) {
    $linha['favoritado'] = $linha['favoritado'] > 0;
    $tabela[] = $linha;
}

$stmt->close();
$conexao->close();

echo json_encode(
    $tabela
        ? [
            'status' => 'ok',
            'mensagem' => 'Sucesso, consulta efetuada.',
            'data' => $tabela
        ]
        : [
            'status' => 'nok',
            'mensagem' => 'Não há registros',
            'data' => []
        ]
);