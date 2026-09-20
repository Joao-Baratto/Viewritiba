<?php
include_once('conexao.php');
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];
if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare(
        "SELECT * FROM evento WHERE id_evento = ?"
    );
    $stmt->bind_param("i", $id);
} elseif (isset($_GET['titulo'])) {
    $titulo = "%" . $_GET['titulo'] . "%";
     $stmt = $conexao->prepare(
        "SELECT * FROM evento
         WHERE titulo LIKE ?
         OR descricao LIKE ?
         OR local LIKE ?"
    );
    $stmt->bind_param("sss", $titulo, $titulo, $titulo);
} else {
    $stmt = $conexao->prepare(
        "SELECT * FROM evento"
    );
}
$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];
if ($resultado->num_rows > 0) {
    while ($linha = $resultado->fetch_assoc()) {
        $tabela[] = $linha;
    }
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