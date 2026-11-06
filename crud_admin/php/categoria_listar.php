<?php
require_once __DIR__ . '/proteger_admin.php';
exigir_moderador();
require_once __DIR__ . '/conexao.php';

$resultado = $conexao->query(
    'SELECT id_categoria, nome_categoria FROM categoria ORDER BY nome_categoria'
);

$categorias = [];
while ($categoria = $resultado->fetch_assoc()) {
    $categorias[] = $categoria;
}

echo json_encode(['status' => 'ok', 'mensagem' => '', 'data' => $categorias]);

$conexao->close();
