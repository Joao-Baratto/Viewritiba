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
require_once __DIR__ . '/../../crud_admin/php/banimentos.php';
exigir_conta_nao_banida($conexao, 'organizador', $id_organizador);
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];
if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare(
        "SELECT * FROM evento WHERE id = ? AND id_organizador = ?"
    );
    $stmt->bind_param("ii", $id, $id_organizador);
} elseif (isset($_GET['titulo']) && isset($_GET['categoria'])) {
    $titulo = "%" . $_GET['titulo'] . "%";
    $categoria = (int) $_GET['categoria'];
    $stmt = $conexao->prepare(
        "SELECT * FROM evento WHERE id_organizador = ? AND titulo LIKE ?
         AND id IN (SELECT id_evento FROM evento_categoria WHERE id_categoria = ?)"
    );
    $stmt->bind_param("isi", $id_organizador, $titulo, $categoria);
} elseif (isset($_GET['titulo'])) {
    $titulo = "%" . $_GET['titulo'] . "%";
    $stmt = $conexao->prepare(
        "SELECT * FROM evento WHERE id_organizador = ? AND titulo LIKE ?"
    );
    $stmt->bind_param("is", $id_organizador, $titulo);
} elseif (isset($_GET['categoria'])) {
    $categoria = (int) $_GET['categoria'];
    $stmt = $conexao->prepare(
        "SELECT * FROM evento WHERE id_organizador = ?
         AND id IN (SELECT id_evento FROM evento_categoria WHERE id_categoria = ?)"
    );
    $stmt->bind_param("ii", $id_organizador, $categoria);
} else {
    $stmt = $conexao->prepare(
        "SELECT * FROM evento WHERE id_organizador = ?"
    );
    $stmt->bind_param("i", $id_organizador);
}
$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];
if ($resultado->num_rows > 0) {
    // busca as categorias de cada evento
    $stmt_categoria = $conexao->prepare(
        "SELECT categoria.id_categoria, categoria.nome_categoria
         FROM evento_categoria
         INNER JOIN categoria ON categoria.id_categoria = evento_categoria.id_categoria
         WHERE evento_categoria.id_evento = ?
         ORDER BY categoria.nome_categoria"
    );
    while ($linha = $resultado->fetch_assoc()) {
        $stmt_categoria->bind_param("i", $linha['id']);
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
