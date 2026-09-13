<?php
    include_once('conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];
    if(isset($_GET['id'])){
        $titulo       = $_POST['titulo']; 
        $descricao      = $_POST['descricao'];
        $data_hora    = $_POST['data_hora'];
        $local      = $_POST['local'];
        $id_organizador  = (int) $_POST['id_organizador'];
        $id = (int) $_GET['id'];
        $stmt = $conexao->prepare("UPDATE evento SET titulo = ?, descricao = ?, data_hora = ?, 
local = ?, id_organizador = ?  WHERE id = ?");
        $stmt->bind_param("ssssii",$titulo, $descricao, $data_hora, $local, $id_organizador, $id);
        $stmt->execute();
        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Registro alterado com sucesso.',
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Não posso alterar um registro.'.json_encode($_GET),
                'data'      => []
            ];
        }
        $stmt->close();
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não posso alterar um registro sem um ID informado.',
            'data'      => []
        ];
    }
    $conexao->close();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);