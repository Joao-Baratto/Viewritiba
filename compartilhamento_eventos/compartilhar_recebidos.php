
<?php
require_once __DIR__ . '/compartilhamento_comum.php';

exigir_metodo('GET');

$usuario = usuario_logado();

if ($usuario === null) {
    responder(401, [
        'status' => 'nok',
        'mensagem' => 'Faça login para visualizar os compartilhamentos.'
    ]);
}

try {
    $stmt = $conexao->prepare(
        "SELECT
            c.id_compartilhamento,
            c.id_evento,
            c.mensagem,
            c.data_compartilhamento,
            e.titulo,
            e.local,
            e.data_hora,
            CASE
                WHEN c.tipo_remetente = 'participante'
                    THEN p.nome
                WHEN c.tipo_remetente = 'organizador'
                    THEN o.nome
            END AS remetente
         FROM compartilhamento c

         INNER JOIN evento e
             ON e.id_evento = c.id_evento

         LEFT JOIN participante p
             ON c.tipo_remetente = 'participante'
             AND p.id = c.id_remetente

         LEFT JOIN organizador o
             ON c.tipo_remetente = 'organizador'
             AND o.id = c.id_remetente

         WHERE c.id_destinatario = ?
           AND c.tipo_destinatario = ?

         ORDER BY c.data_compartilhamento DESC,
                  c.id_compartilhamento DESC"
    );

    $stmt->bind_param(
        'is',
        $usuario['id'],
        $usuario['tipo']
    );

    $stmt->execute();

    $resultado = $stmt->get_result();
    $compartilhados = [];

    while ($linha = $resultado->fetch_assoc()) {
        $compartilhados[] = $linha;
    }

    $stmt->close();

    responder(200, [
        'status' => 'ok',
        'data' => $compartilhados
    ]);

} catch (Throwable $erro) {
    error_log(
        'Erro ao buscar compartilhamentos: ' . $erro->getMessage()
    );

    responder(500, [
        'status' => 'nok',
        'mensagem' => 'Não foi possível carregar os eventos recebidos.'
    ]);
}
