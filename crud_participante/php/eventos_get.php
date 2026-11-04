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
exigir_conta_nao_banida($conexao, 'participante', (int) $_SESSION['participante_id']);
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];
$sql = "SELECT evento.*, organizador.nome AS organizador FROM evento
        LEFT JOIN organizador ON organizador.id = evento.id_organizador";
if (isset($_GET['titulo']) && isset($_GET['categoria'])) {
    $titulo = "%" . $_GET['titulo'] . "%";
    $categoria = (int) $_GET['categoria'];
    $stmt = $conexao->prepare(
        "$sql WHERE evento.titulo LIKE ?
         AND evento.id IN (SELECT id_evento FROM evento_categoria WHERE id_categoria = ?)"
    );
    $stmt->bind_param("si", $titulo, $categoria);
} elseif (isset($_GET['titulo'])) {
    $titulo = "%" . $_GET['titulo'] . "%";
    $stmt = $conexao->prepare("$sql WHERE evento.titulo LIKE ?");
    $stmt->bind_param("s", $titulo);
} elseif (isset($_GET['categoria'])) {
    $categoria = (int) $_GET['categoria'];
    $stmt = $conexao->prepare(
        "$sql WHERE evento.id IN (SELECT id_evento FROM evento_categoria WHERE id_categoria = ?)"
    );
    $stmt->bind_param("i", $categoria);
} else {
    $stmt = $conexao->prepare($sql);
}
$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];
if ($resultado->num_rows > 0) {

    $stmt_categoria = $conexao->prepare(
        "SELECT categoria.nome_categoria FROM evento_categoria
         INNER JOIN categoria ON categoria.id_categoria = evento_categoria.id_categoria
         WHERE evento_categoria.id_evento = ? ORDER BY categoria.nome_categoria"
    );
    while ($linha = $resultado->fetch_assoc()) {
        $stmt_categoria->bind_param("i", $linha['id']);
        $stmt_categoria->execute();
        $resultado_categoria = $stmt_categoria->get_result();
        $nomes = [];
        while ($categoria_linha = $resultado_categoria->fetch_assoc()) {
            $nomes[] = $categoria_linha['nome_categoria'];
        }
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
