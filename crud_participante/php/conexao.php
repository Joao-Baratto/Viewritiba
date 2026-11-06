<?php

$servidor = 'localhost';
$usuario = 'root';
$senha = '';
$banco = 'viewritiba';

mysqli_report(MYSQLI_REPORT_OFF);
$conexao = new mysqli($servidor, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    error_log("Erro de conexão com o banco de dados de participantes: " . $conexao->connect_error);
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Não foi possível conectar ao banco de dados. Confirme se o MySQL está ativo e se o banco viewritiba existe."
    ]);
    exit;

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
