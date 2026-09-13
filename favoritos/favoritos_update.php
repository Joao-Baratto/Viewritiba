<?php
session_start();
include_once('../crud_evento/php/conexao.php');
header("Content-type:application/json;charset=utf-8");

if (!isset($_SESSION['usuario'][0]['id'])) {
    $retorno = ['status' => 'nok', 'mensagem' => 'Usuário não logado'];
    echo json_encode($retorno);
    exit;
}
$usuario_ $_SESSION['usuario'][0]['id'];
$evento_id = (int) ($_POST['evento_id'] ?? 0);
$observacao = $_POST['observacao'] ?? '';

$stmt = $conexao->prepare("UPDATE favorito SET observacao = ? WHERE usuario_id = ? AND evento_id = ?");
$stmt->bind_param("sii", $observacao, $usuario_id, $evento_id);

$retorno = $stmt->execute()
    ? ['status' => 'ok', 'mensagem' => 'Observação salva com sucesso!']
    : ['status' => 'nok', 'mensagem' => 'Erro ao atualizar observação'];

$stmt->close();
$conexao->close();
echo json_encode($retorno);