<?php
$servidor = "localhost";
$usuario  = "root";
$senha_banco    = "";
$nome_banco = "viewritiba";

$conexao = new mysqli($servidor, $usuario, $senha_banco, $nome_banco);
if($conexao->connect_error){
    http_response_code(500);
    die(json_encode([
        'status' => 'erro_conexao',
        'mensagem' => 'Erro ao conectar ao banco de dados: ' . $conexao->connect_error
    ]));
}

$conexao->set_charset("utf8mb4");