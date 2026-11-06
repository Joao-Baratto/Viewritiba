<?php

$servidor = 'localhost';
$usuario = 'root';
$senha_banco = '';
$banco = 'viewritiba';

$conexao = new mysqli($servidor, $usuario, $senha_banco, $banco);

// banco de dados MySQL
if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
    
}