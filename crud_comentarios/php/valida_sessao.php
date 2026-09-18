<?php
    session_start();
    if(isset($_SESSION['usuario']) || isset($_SESSION['organizador_id'])){
        $retorno = [
            'status'    => 'ok', 
            'mensagem'  => '', 
            'data'      => []
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