<?php
include_once('conexao.php');
$retorno = [
    'status' => '',
    'mensagem_retorno' => '',
    'data' => []
];
if(isset($_GET['id_evento'])){

    $id_evento = (int) $_GET['id_evento'];

    $stmt = $conexao->prepare("DELETE FROM avaliacao_comentario WHERE id_evento = ?");
    $stmt->bind_param("i", $id_evento);
    $stmt->execute();
    $stmt->close();

    $stmt = $conexao->prepare("DELETE FROM evento WHERE id_evento = ?");
    $stmt->bind_param("i", $id_evento);
    $stmt->execute();

    if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem_retorno'  => 'Evento excluído com sucesso.',
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem_retorno'  => 'Evento não encontrado.',
                'data'      => []
            ];
        }
        $stmt->close();
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem_retorno'  => 'É necessário informar um ID de evento para excluir.',
            'data'      => []
        ];
    }
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);