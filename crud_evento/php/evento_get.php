<?php
include_once('conexao.php');
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];
$select = "SELECT evento.*, usuario.nome AS nome_organizador FROM evento
           LEFT JOIN usuario ON usuario.id_usuario = evento.id_organizador";
if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare(
        $select . " WHERE evento.id_evento = ?"
    );
    $stmt->bind_param("i", $id);
} elseif (isset($_GET['titulo']) && isset($_GET['categoria'])) {
    $titulo = "%" . $_GET['titulo'] . "%";
    $categoria = (int) $_GET['categoria'];
    $stmt = $conexao->prepare(
        $select . " WHERE (evento.titulo LIKE ? OR evento.descricao LIKE ? OR evento.local LIKE ?)
         AND evento.id_evento IN (SELECT id_evento FROM evento_categoria WHERE id_categoria = ?)"
    );
    $stmt->bind_param("sssi", $titulo, $titulo, $titulo, $categoria);
} elseif (isset($_GET['titulo'])) {
    $titulo = "%" . $_GET['titulo'] . "%";
    $stmt = $conexao->prepare(
        $select . " WHERE evento.titulo LIKE ?
         OR evento.descricao LIKE ?
         OR evento.local LIKE ?"
    );
    $stmt->bind_param("sss", $titulo, $titulo, $titulo);
} elseif (isset($_GET['categoria'])) {
    $categoria = (int) $_GET['categoria'];
    $stmt = $conexao->prepare(
        $select . " WHERE evento.id_evento IN (SELECT id_evento FROM evento_categoria WHERE id_categoria = ?)"
    );
    $stmt->bind_param("i", $categoria);
} else {
    $stmt = $conexao->prepare(
        $select
    );
}
$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];
if ($resultado->num_rows > 0) {
    $stmt_categoria = $conexao->prepare(
        "SELECT categoria.id_categoria, categoria.nome_categoria FROM evento_categoria
         INNER JOIN categoria ON categoria.id_categoria = evento_categoria.id_categoria
         WHERE evento_categoria.id_evento = ?
         ORDER BY categoria.nome_categoria"
    );
    while ($linha = $resultado->fetch_assoc()) {
        $stmt_categoria->bind_param("i", $linha['id_evento']);
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
        'mensagem' => 'Nenhum evento encontrado.',
        'data' => []
    ];
}
$stmt->close();
$conexao->close();
header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);