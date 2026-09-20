<?php
include_once('conexao.php');
$retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
];
if(isset($_GET['id'])){
    $id = (int) $_GET['id'];
    $titulo = trim($_POST['titulo'] ?? '');
    $descricao = trim($_POST['descricao'] ?? '');
    $data_hora = $_POST['data_hora'] ?? '';
    $local = trim($_POST['local'] ?? '');
    $id_organizador = (int) ($_POST['id_organizador'] ?? 0);
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
        $stmt = $conexao->prepare("UPDATE evento SET titulo = ?, descricao = ?, data_hora = ?, 
    local = ?, id_organizador = ?  WHERE id_evento = ?");
        $stmt->bind_param("ssssii",$titulo, $descricao, $data_hora, $local, $id_organizador, $id);
        if ($stmt->execute()) {
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
      }
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