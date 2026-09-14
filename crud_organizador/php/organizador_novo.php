<?php

include_once("conexao.php");

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';

    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

    $stmt = $conexao->prepare(
        "INSERT INTO usuario (nome, email, tipo_usuario, senha, status_usuario)
         VALUES (?, ?, 'organizador', ?, 'ativo')"
    );
    $stmt->bind_param("sss", $nome, $email, $senha_hash);

    $stmt->execute();

    if($stmt->affected_rows > 0){
        $retorno = [
            'status' => 'sucesso',
            'mensagem' => 'Organizador cadastrado com sucesso!',
            'data' => []
        ];
    }else{
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'Falha ao cadastrar. O e-mail ou documento já pode estar em uso.',
            'data' => []
        ];
    }

    $stmt->close();
    $conexao->close();
    
    header("Content-Type: application/json; charset=utf-8");

    echo json_encode($retorno);
    
    ?>