<?php
session_start();
include_once('../php/usuario_logado.php');

if (usuario_logado() !== null) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => '',
        'data' => []
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Faça login como organizador ou participante.',
        'data' => []
    ];
}
header("Content-type:application/json;charset=utf-8");
echo json_encode($retorno);
