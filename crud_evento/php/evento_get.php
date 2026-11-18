<?php
session_start();
header("Content-Type: application/json; charset=utf-8");
if (!isset($_SESSION['organizador_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Faça login como organizador para consultar seus eventos.',
        'data' => []
    ]);
    exit;
}
include_once('conexao.php');
$id_organizador = (int) $_SESSION['organizador_id'];
require_once __DIR__. '/../../crud_admin/php/banimentos.php';
exigir_conta_nao_banida($conexao, 'organizador', $id_organizador);
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];
// "categoria" aceita um id ou uma lista separada por vírgula (ex.: 1,3).
function ids_categorias($valor)
{
    $ids = array_values(array_unique(array_filter(
        array_map('intval', explode(',', (string) $valor))
    )));
    return $ids ? $ids : [0];
}

$consulta = "
    SELECT evento.*, organizador.nome AS organizador
    FROM evento
    LEFT JOIN organizador
        ON organizador.id = evento.id_organizador
";
if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare(
        "$consulta
         WHERE evento.id = ?
           AND evento.id_organizador = ?"
    );
    $stmt->bind_param("ii", $id, $id_organizador);
} elseif (isset($_GET['titulo']) && isset($_GET['categoria'])) {
    $busca = "%" . trim($_GET['titulo']) . "%";
    $categorias = ids_categorias($_GET['categoria']);
    $marcas = implode(',', array_fill(0, count($categorias), '?'));
    $stmt = $conexao->prepare(
        "$consulta
         WHERE evento.id_organizador = ?
           AND (
               evento.titulo LIKE ?
               OR evento.descricao LIKE ?
               OR evento.local LIKE ?
               OR organizador.nome LIKE ?
           )
           AND evento.id IN (
               SELECT id_evento
               FROM evento_categoria
               WHERE id_categoria IN ($marcas)
           )"
    );
    $stmt->bind_param(
        "issss" . str_repeat('i', count($categorias)),
        $id_organizador,
        $busca,
        $busca,
        $busca,
        $busca,
        ...$categorias
    );
} elseif (isset($_GET['titulo'])) {
    $busca = "%" . trim($_GET['titulo']) . "%";
    $stmt = $conexao->prepare(
        "$consulta
         WHERE evento.id_organizador = ?
           AND (
               evento.titulo LIKE ?
               OR evento.descricao LIKE ?
               OR evento.local LIKE ?
               OR organizador.nome LIKE ?
           )"
    );
    $stmt->bind_param(
        "issss",
        $id_organizador,
        $busca,
        $busca,
        $busca,
        $busca
    );
} elseif (isset($_GET['categoria'])) {
    $categorias = ids_categorias($_GET['categoria']);
    $marcas = implode(',', array_fill(0, count($categorias), '?'));
    $stmt = $conexao->prepare(
        "$consulta
         WHERE evento.id_organizador = ?
           AND evento.id IN (
               SELECT id_evento
               FROM evento_categoria
               WHERE id_categoria IN ($marcas)
           )"
    );
    $stmt->bind_param(
        "i" . str_repeat('i', count($categorias)),
        $id_organizador,
        ...$categorias
    );
} else {
    $stmt = $conexao->prepare(
        "$consulta
         WHERE evento.id_organizador = ?"
    );
    $stmt->bind_param("i", $id_organizador);
}
$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];
if ($resultado->num_rows > 0) {
    // Busca as categorias de cada evento.
    $stmt_categoria = $conexao->prepare(
        "SELECT categoria.id_categoria, categoria.nome_categoria
         FROM evento_categoria
         INNER JOIN categoria
             ON categoria.id_categoria = evento_categoria.id_categoria
         WHERE evento_categoria.id_evento = ?
         ORDER BY categoria.nome_categoria"
    );
    while ($linha = $resultado->fetch_assoc()) {
        $id_evento = (int) $linha['id'];
        $stmt_categoria->bind_param("i", $id_evento);
        $stmt_categoria->execute();
        $resultado_categoria = $stmt_categoria->get_result();
        $ids = [];
        $nomes = [];
        while ($categoria_linha = $resultado_categoria->fetch_assoc()) {
            $ids[] = $categoria_linha['id_categoria'];
            $nomes[] = $categoria_linha['nome_categoria'];
        }
        $linha['categorias_ids'] = $ids;
        $linha['categorias'] = implode(", ", $nomes);
        $tabela[] = $linha;
    }
    $stmt_categoria->close();
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
$stmt->close();
$conexao->close();
echo json_encode($retorno);