<?php

include_once("conexao.php");

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

    $nome = $_POST['nome'];
    $documento = $_POST['documento'];
    $email = $_POST['email'];
    $telefone = $_POST['telefone'];
    $senha = $_POST['senha'];

    if (strlen($senha) !== 6) {
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'A senha deve ter exatamente 6 caracteres.',
            'data' => []
        ];

        header("Content-Type: application/json; charset=utf-8");
        echo json_encode($retorno);
        exit;
    }

    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

    $stmt = $conexao->prepare("INSERT INTO participante (nome, documento, email, telefone, senha) VALUES (?, ?, ?, ?, ?)");
    $stmt ->bind_param("sssss", $nome, $documento, $email, $telefone, $senha_hash);

    $stmt->execute();

    if($stmt->affected_rows > 0){
        $retorno = [
            'status' => 'sucesso',
            'mensagem' => 'participante cadastrado com sucesso!',
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