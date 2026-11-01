<?php
include_once(__DIR__ . '/compartilhamento_comum.php');
 
exigir_metodo('POST');
 
$id_remetente = id_usuario_logado();
if (!$id_remetente) {
    responder(401, ['status' => 'nok', 'mensagem' => 'Faça login para compartilhar.']);
}
 
$id_evento = (int) ($_POST['evento_id'] ?? 0);
$email     = trim($_POST['email_destino'] ?? '');
$mensagem  = trim($_POST['mensagem'] ?? '');
 
// Validações simples, antes de tocar no banco
if ($id_evento <= 0) {
    responder(400, ['status' => 'nok', 'mensagem' => 'Evento inválido.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(400, ['status' => 'nok', 'mensagem' => 'Digite um e-mail válido.']);
}
if (mb_strlen($mensagem) > 200) {
    responder(400, ['status' => 'nok', 'mensagem' => 'A mensagem pode ter no máximo 200 caracteres.']);
}
 
try {
    // 1) O evento existe?
    $stmt = $conexao->prepare("SELECT id_evento FROM evento WHERE id_evento = ?");
    $stmt->bind_param("i", $id_evento);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        responder(404, ['status' => 'nok', 'mensagem' => 'Evento não encontrado.']);
    }
    $stmt->close();
 
    // 2) Existe um usuário com esse e-mail?
    $stmt = $conexao->prepare("SELECT id_usuario FROM usuario WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $destino = $stmt->get_result()->fetch_assoc();
    $stmt->close();
 
    if (!$destino) {
        responder(404, ['status' => 'nok', 'mensagem' => 'Nenhum usuário do Viewritiba usa esse e-mail.']);
    }
 
    $id_destinatario = (int) $destino['id_usuario'];
 
    // 3) Não faz sentido enviar para si mesmo
    if ($id_destinatario === (int) $id_remetente) {
        responder(400, ['status' => 'nok', 'mensagem' => 'Você não pode enviar o evento para você mesmo.']);
    }
 
    // 4) Grava o compartilhamento
    $stmt = $conexao->prepare(
        "INSERT INTO compartilhamento (id_evento, id_remetente, id_destinatario, mensagem)
         VALUES (?, ?, ?, ?)"
    );
    $stmt->bind_param("iiis", $id_evento, $id_remetente, $id_destinatario, $mensagem);
    $stmt->execute();
    $stmt->close();
 
    responder(200, ['status' => 'ok', 'mensagem' => 'Evento enviado!']);
 
} catch (mysqli_sql_exception $e) {
    // 1062 = já existe a combinação (evento + remetente + destinatário)
    if ($e->getCode() === 1062) {
        responder(409, ['status' => 'nok', 'mensagem' => 'Você já enviou esse evento para essa pessoa.']);
    }
    // Qualquer outro erro de banco: detalhe vai pro log, o usuário vê só uma mensagem genérica
    error_log('compartilhar_enviar: ' . $e->getMessage());
    responder(500, ['status' => 'nok', 'mensagem' => 'Não foi possível enviar agora. Tente novamente.']);
}
 