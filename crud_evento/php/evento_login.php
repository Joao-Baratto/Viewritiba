<?php
include_once('conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$email = trim($_POST['usuario'] ?? '');
$senha = $_POST['senha'] ?? '';

$stmt = $conexao->prepare(
    "SELECT * FROM usuario WHERE email = ? AND status_usuario = 'ativo'"
);

$stmt->bind_param(
    "s",
    $email
);

$stmt->execute();

$resultado = $stmt->get_result();

$tabela = [];

if ($resultado->num_rows > 0) {

    $linha = $resultado->fetch_assoc();
    if (!password_verify($senha, $linha['senha'])) {
        $linha = null;
    }

    if ($linha != null) {
        unset($linha['senha']);
        $tabela[] = $linha;
    }

    session_start();
    if (count($tabela) > 0) {
        session_regenerate_id(true);
        $_SESSION['usuario'] = $tabela;
        $_SESSION['usuario_id'] = (int) $linha['id_usuario'];
        $_SESSION['usuario_tipo'] = $linha['tipo_usuario'];
    }

    if (count($tabela) > 0) {
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