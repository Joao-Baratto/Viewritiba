<?php
$servidor = "localhost:3306";
$usuario = "root";
$senha_banco = "";
$nome_banco = "viewritiba";
$conexao = new mysqli($servidor, $usuario, $senha_banco, $nome_banco);
$conexao->set_charset("utf8mb4");
