
<?php
require_once __DIR__ . '/compartilhamento_comum.php';

exigir_metodo('POST');

$usuario = usuario_logado();

if ($usuario === null) {
    responder(401, [
        'status' => 'nok',
        'mensagem' => 'Faça login para compartilhar eventos.'
    ]);
}

$id_evento = filter_var(
    $_POST['evento_id'] ?? null,
    FILTER_VALIDATE_INT
);

$email = trim($_POST['email_destino'] ?? '');
$mensagem = trim($_POST['mensagem'] ?? '');

if (!$id_evento || $id_evento <= 0) {
    responder(400, [
        'status' => 'nok',
        'mensagem' => 'Evento inválido.'
    ]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(400, [
        'status' => 'nok',
        'mensagem' => 'Informe um e-mail válido.'
    ]);
}

if (mb_strlen($mensagem, 'UTF-8') > 200) {
    responder(400, [
        'status' => 'nok',
        'mensagem' => 'A mensagem deve ter até 200 caracteres.'
    ]);
}

try {
    // Confere se o evento existe.
    $stmt = $conexao->prepare(
        'SELECT id_evento FROM evento WHERE id_evento = ?'
    );
    $stmt->bind_param('i', $id_evento);
    $stmt->execute();
    $evento = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$evento) {
        responder(404, [
            'status' => 'nok',
            'mensagem' => 'Evento não encontrado.'
        ]);
    }

    // Procura o e-mail entre participantes e organizadores.
    $destinatarios = [];

    foreach (['participante', 'organizador'] as $tipo) {
        $stmt = $conexao->prepare(
            "SELECT id FROM {$tipo} WHERE email = ? LIMIT 1"
        );
        $stmt->bind_param('s', $email);
        $stmt->execute();

        $conta = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($conta) {
            $destinatarios[] = [
                'id' => (int) $conta['id'],
                'tipo' => $tipo
            ];
        }
    }

    if (count($destinatarios) === 0) {
        responder(404, [
            'status' => 'nok',
            'mensagem' => 'Nenhum usuário encontrado com esse e-mail.'
        ]);
    }

    if (count($destinatarios) > 1) {
        responder(409, [
            'status' => 'nok',
            'mensagem' => 'Esse e-mail pertence a mais de um tipo de conta. Não foi possível identificar o destinatário.'
        ]);
    }

    $destinatario = $destinatarios[0];

    if (
        $usuario['id'] === $destinatario['id'] &&
        $usuario['tipo'] === $destinatario['tipo']
    ) {
        responder(400, [
            'status' => 'nok',
            'mensagem' => 'Você não pode enviar um evento para si mesmo.'
        ]);
    }

    // Verifica se o mesmo compartilhamento já existe.
    $stmt = $conexao->prepare(
        'SELECT id_compartilhamento
         FROM compartilhamento
         WHERE id_evento = ?
           AND id_remetente = ?
           AND tipo_remetente = ?
           AND id_destinatario = ?
           AND tipo_destinatario = ?
         LIMIT 1'
    );

    $stmt->bind_param(
        'iisis',
        $id_evento,
        $usuario['id'],
        $usuario['tipo'],
        $destinatario['id'],
        $destinatario['tipo']
    );

    $stmt->execute();
    $existente = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($existente) {
        responder(409, [
            'status' => 'nok',
            'mensagem' => 'Você já compartilhou esse evento com essa pessoa.'
        ]);
    }

    // Registra o compartilhamento.
    $stmt = $conexao->prepare(
        'INSERT INTO compartilhamento (
            id_evento,
            id_remetente,
            tipo_remetente,
            id_destinatario,
            tipo_destinatario,
            mensagem
        ) VALUES (?, ?, ?, ?, ?, ?)'
    );

    $stmt->bind_param(
        'iisiss',
        $id_evento,
        $usuario['id'],
        $usuario['tipo'],
        $destinatario['id'],
        $destinatario['tipo'],
        $mensagem
    );

    $stmt->execute();
    $stmt->close();

    responder(200, [
        'status' => 'ok',
        'mensagem' => 'Evento compartilhado com sucesso!'
    ]);

 } catch (mysqli_sql_exception $erro) {
    if ((int) $erro->getCode() === 1062) {
        responder(409, [
            'status' => 'nok',
            'mensagem' => 'Esse evento já foi compartilhado com essa pessoa.'
        ]);
    }

    error_log('Erro ao compartilhar: ' . $erro->getMessage());

    responder(500, [
        'status' => 'nok',
        'mensagem' => 'Erro no banco de dados. Consulte o log do servidor.',
 ]);

} catch (Throwable $erro) {
    error_log('Erro ao compartilhar: ' . $erro->getMessage());

    responder(500, [
        'status' => 'nok',
        'mensagem' => 'Erro interno ao compartilhar o evento.'
    ]);
}
