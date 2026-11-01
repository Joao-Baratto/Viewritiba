<?php

function exigir_moderador($validar_csrf = false)
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    header('Content-Type: application/json; charset=utf-8');

    if (($_SESSION['papel'] ?? '') !== 'moderador') {
        http_response_code(401);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Faça login como moderador para continuar.'
        ]);
        exit;
    }

    if ($validar_csrf) {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $token_sessao = $_SESSION['moderador_csrf'] ?? '';

        if ($token_sessao === '' || !hash_equals($token_sessao, $token)) {
            http_response_code(403);
            echo json_encode([
                'status' => 'erro',
                'mensagem' => 'A sessão expirou. Atualize a página e tente novamente.'
            ]);
            exit;
        }
    }
}
