<?php

header("Content-Type: application/json; charset=utf-8");
require_once "conexao.php";

$resultado = $conexao->query(
    "SELECT id_categoria, nome_categoria
       FROM categoria
      ORDER BY nome_categoria"
);

if (!$resultado) {
    error_log("Erro ao carregar categorias dos eventos: " . $conexao->error);
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Não foi possível carregar as categorias.',
        'data' => []
    ]);
    $conexao->close();
    exit;
}

$categorias = [];
while ($categoria = $resultado->fetch_assoc()) {
    $categorias[] = $categoria;
}

$conexao->close();
echo json_encode([
    'status' => $categorias ? 'ok' : 'nok',
    'mensagem' => $categorias ? 'Sucesso, consulta efetuada.' : 'Nenhuma categoria encontrada.',
    'data' => $categorias
]);
