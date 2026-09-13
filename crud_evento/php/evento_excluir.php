<?php
    include_once('conexao.php');
    $retorno = [
        'status'    => '', 
        'mensagem'  => '', 
        'data'      => []
    ];
    if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
            $stmt = $conexao->prepare("DELETE FROM evento WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok', 
                'mensagem'  => 'Registro excluido', 
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Registro não excluido', 
                'data'      => []
            ];
        }
    $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok', // ok - nok
            'mensagem'  => 'É necessário informar um ID para exclusão', 
            'data'      => []
        ];
    }
    $conexao->close();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);