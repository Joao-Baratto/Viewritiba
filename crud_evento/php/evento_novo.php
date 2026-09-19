<?php
    include_once('conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];
    $titulo       = trim ($_POST['titulo'] ?? ''); 
    $descricao      = trim ($_POST['descricao'] ?? '');
    $data_hora    = $_POST['data_hora'] ?? '';
    $local      = trim ($_POST['local'] ?? '');
    $id_organizador   =(int) ($_POST['id_organizador'] ?? 0);
    if (
    $titulo === '' ||
    $descricao === '' ||
    $data_hora === '' ||
    $local === '' ||
    $id_organizador <= 0
) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Preencha corretamente todos os campos obrigatórios.',
        'data' => []
    ];
    } else {
    $stmt = $conexao->prepare("
    INSERT INTO evento(titulo, descricao, data_hora, local, id_organizador) 
VALUES(?,?,?,?,?)");
    $stmt->bind_param("ssssi",$titulo, $descricao, $data_hora, $local, $id_organizador);
    $stmt->execute();
    if($stmt->affected_rows > 0){
        $retorno = [
            'status' => 'ok',
            'mensagem' => 'registro inserido com sucesso',
            'data' => []
        ];
    }else{
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'falha ao inserir o registro',
            'data' => []
        ];
    }
    $stmt->close();
    }
    $conexao->close();
     header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);