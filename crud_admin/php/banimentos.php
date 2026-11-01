<?php

const AVISO_PADRAO_BANIMENTO = 'Esta conta foi suspensa pela equipe de moderação por atividade considerada incompatível com os Regulamentos da Comunidade e os Termos de Uso do Viewritiba. Se você acredita que houve um engano, entre em contato com a equipe de suporte para solicitar uma revisão.';

function obter_banimento_conta($conexao, $tipo, $id)
{
    $stmt = $conexao->prepare(
        'SELECT motivo, banido_em FROM conta_banimento
         WHERE tipo_conta = ? AND id_conta = ? LIMIT 1'
    );
    $stmt->bind_param('si', $tipo, $id);
    $stmt->execute();
    $banimento = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $banimento ?: null;
}

function mostrar_pagina_banimento($banimento)
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    session_regenerate_id(true);
    $_SESSION = [];
    $_SESSION['aviso_banimento'] = [
        'aviso_padrao' => AVISO_PADRAO_BANIMENTO,
        'motivo' => $banimento['motivo'],
        'banido_em' => $banimento['banido_em']
    ];
}

function exigir_conta_nao_banida($conexao, $tipo, $id)
{
    $banimento = obter_banimento_conta($conexao, $tipo, $id);
    if ($banimento === null) {
        return;
    }

    mostrar_pagina_banimento($banimento);
    $raiz_aplicacao = dirname($_SERVER['SCRIPT_NAME'], 3);
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'banido',
        'mensagem' => AVISO_PADRAO_BANIMENTO,
        'redirect' => rtrim($raiz_aplicacao, '/') . '/crud_admin/conta_banida.php'
    ]);
    exit;
}
