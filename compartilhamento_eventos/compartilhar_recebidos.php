<?php
include_once(__DIR__ . '/compartilhamento_comum.php');
 
exigir_metodo('GET');
 
$id_usuario = id_usuario_logado();
if (!$id_usuario) {
    responder(401, ['status' => 'nok', 'mensagem' => 'Faça login para ver os eventos recebidos.']);
}
 
try {
    // JOIN com evento (dados do evento) e usuario (nome de quem enviou)
    $stmt = $conexao->prepare(
        "SELECT c.id_compartilhamento, c.mensagem, c.data_compartilhamento,
                e.id_evento, e.titulo, e.local, e.data_hora,
                u.nome AS remetente
         FROM compartilhamento c
         INNER JOIN evento e  ON e.id_evento  = c.id_evento
         INNER JOIN usuario u ON u.id_usuario = c.id_remetente
         WHERE c.id_destinatario = ?
         ORDER BY c.data_compartilhamento DESC"
    );
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();
 
    $lista = [];
    while ($linha = $resultado->fetch_assoc()) {
        $lista[] = $linha;
    }
    $stmt->close();
 
    // Lista vazia NÃO é erro: devolve ok com data = []
    responder(200, ['status' => 'ok', 'mensagem' => 'Sucesso', 'data' => $lista]);
 
} catch (mysqli_sql_exception $e) {
    error_log('compartilhar_recebidos: ' . $e->getMessage());
    responder(500, ['status' => 'nok', 'mensagem' => 'Não foi possível carregar agora.']);
}
 