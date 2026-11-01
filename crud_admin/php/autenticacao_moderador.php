<?php

function obter_configuracao_moderador($chave)
{
    $valor = getenv($chave);
    if (($valor === false || $valor === '') && isset($_SERVER[$chave])) {
        $valor = $_SERVER[$chave];
    }

    return $valor === false ? '' : trim($valor);
}

function autenticar_moderador($usuario, $senha)
{
    $usuario_configurado = obter_configuracao_moderador('VIEWRITIBA_MODERATOR_USER');
    $hash_configurado = obter_configuracao_moderador('VIEWRITIBA_MODERATOR_PASSWORD_HASH');

    if ($usuario_configurado === '' || $hash_configurado === '') {
        error_log('Credenciais do moderador não configuradas no ambiente do servidor.');
        return false;
    }

    if (!hash_equals($usuario_configurado, $usuario) || !password_verify($senha, $hash_configurado)) {
        return false;
    }

    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    session_regenerate_id(true);
    $_SESSION = [];
    $_SESSION['papel'] = 'moderador';
    $_SESSION['moderador_nome'] = $usuario_configurado;
    $_SESSION['moderador_csrf'] = bin2hex(random_bytes(32));

    return true;
}
