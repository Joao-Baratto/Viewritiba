<?php
require_once __DIR__ . '/proteger_admin.php';
exigir_moderador();
require_once __DIR__ . '/conexao.php';

$eventos_resultado = $conexao->query(
    "SELECT e.id, e.titulo, e.data_hora, e.`local`,
            COALESCE(o.nome, 'Organizador indisponível') AS organizador
     FROM evento e
     LEFT JOIN organizador o ON o.id = e.id_organizador
     ORDER BY e.data_hora DESC"
);

$eventos = [];
while ($evento = $eventos_resultado->fetch_assoc()) {
    $eventos[] = $evento;
}

$comentarios_resultado = $conexao->query(
    'SELECT c.id, c.id_evento, c.usuario, c.comentario, c.data, e.titulo AS evento
     FROM comentario c
     INNER JOIN evento e ON e.id = c.id_evento
     ORDER BY c.data DESC'
);

$comentarios = [];
while ($comentario = $comentarios_resultado->fetch_assoc()) {
    $comentarios[] = $comentario;
}

$contas_resultado = $conexao->query(
    "SELECT contas.tipo_conta, contas.id, contas.nome, contas.email,
            banimentos.motivo, banimentos.banido_em
     FROM (
         SELECT 'organizador' AS tipo_conta, id, nome, email FROM organizador
         UNION ALL
         SELECT 'participante' AS tipo_conta, id, nome, email FROM participante
     ) AS contas
     LEFT JOIN conta_banimento AS banimentos
       ON banimentos.tipo_conta = contas.tipo_conta
      AND banimentos.id_conta = contas.id
     ORDER BY contas.tipo_conta, contas.nome"
);

$contas = [];
while ($conta = $contas_resultado->fetch_assoc()) {
    $contas[] = $conta;
}

echo json_encode([
    'status' => 'ok',
    'eventos' => $eventos,
    'comentarios' => $comentarios,
    'contas' => $contas
]);

$conexao->close();
