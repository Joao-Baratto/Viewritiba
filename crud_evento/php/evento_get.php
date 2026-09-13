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
        "SELECT * FROM evento WHERE id = ?"
    );
    $stmt->bind_param("i", $id);
} elseif (isset($_GET['titulo'])) {
    $titulo = "%" . $_GET['titulo'] . "%";
    $stmt = $conexao->prepare(
        "SELECT * FROM evento WHERE titulo LIKE ?"
    );
    $stmt->bind_param("s", $titulo);
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
        'mensagem' => 'Não há registros',
        'data' => []
    ];
}
$stmt->close();
$conexao->close();
header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);