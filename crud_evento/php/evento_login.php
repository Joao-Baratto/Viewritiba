<?php

include_once('conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$stmt = $conexao->prepare(
    "SELECT * FROM cliente WHERE usuario = ? AND senha = ?"
);

$stmt->bind_param(
    "ss",
    $_POST['usuario'],
    $_POST['senha']
);

$stmt->execute();

$resultado = $stmt->get_result();

$tabela = [];

if ($resultado->num_rows > 0) {

    while ($linha = $resultado->fetch_assoc()) {
        $tabela[] = $linha;
    }

    session_start();

    $_SESSION['usuario'] = $tabela;

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Login realizado com sucesso.',
        'data' => $tabela
    ];

} else {

    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Usuário ou senha incorretos.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");

echo json_encode($retorno);
?>