<?php
    session_start();
    include_once('../../php/usuario_logado.php');
    $usuario = usuario_logado();
    if($usuario != null){
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => '',
            'data'      => ['tipo' => $usuario['tipo']]
        ];
    }else{
        $retorno = [
            'status'    => 'nok', 
            'mensagem'  => '', 
            'data'      => []
        ];
    }
    header("Content-type:application/json;charset:utf-8;");
    echo json_encode($retorno);