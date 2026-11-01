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
    $categorias = $_POST['categorias'] ?? [];
    if (
        $titulo === '' ||
        $descricao === '' ||
        $data_hora === '' ||
        $local === '' ||
        $id_organizador <= 0 ||
        count($categorias) == 0
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
            $stmt_categoria = $conexao->prepare("DELETE FROM evento_categoria WHERE id_evento = ?");
            $stmt_categoria->bind_param("i", $id);
            $stmt_categoria->execute();
            $stmt_categoria->close();
            $stmt_categoria = $conexao->prepare("INSERT INTO evento_categoria (id_evento, id_categoria) VALUES (?, ?)");
            foreach ($categorias as $id_categoria) {
                $id_categoria = (int) $id_categoria;
                $stmt_categoria->bind_param("ii", $id, $id_categoria);
                $stmt_categoria->execute();
            }
            $stmt_categoria->close();
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Registro alterado com sucesso.',
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Não foi possível alterar o registro.'.json_encode($_GET),
                'data'      => []
            ];
        }
        $stmt->close();
      }
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não foi possível alterar o registro sem um ID informado.',
            'data'      => []
        ];
    }
    $conexao->close();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);