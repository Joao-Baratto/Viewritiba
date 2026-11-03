<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexao.php';

$resultado = $conexao->query(
    "SELECT e.id, e.titulo, e.descricao, e.data_hora, e.`local`,
            COALESCE(o.nome, 'Organizador indisponível') AS organizador
     FROM evento e
     LEFT JOIN organizador o ON o.id = e.id_organizador
     ORDER BY e.data_hora ASC"
);

$eventos = [];
while ($evento = $resultado->fetch_assoc()) {
    $eventos[] = $evento;
}

echo json_encode(['status' => 'ok', 'data' => $eventos]);

$conexao->close();
