<?php

$servidor = 'localhost';
$usuario = 'root';
$senha = '';
$banco = 'viewritiba';

$conexao = new mysqli($servidor, $usuario, $senha, $banco);

// banco de dados MySQL
if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
    
}