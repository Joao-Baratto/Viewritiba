<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

$autenticado = !empty($_SESSION['participante_id']);

echo json_encode([
	'status' => $autenticado ? 'ok' : 'nok',
	'mensagem' => $autenticado ? 'Sessão válida.' : 'Sessão inválida.',
	'data' => $autenticado ? [
		'id_usuario' => $_SESSION['participante_id'],
		'nome' => $_SESSION['participante_nome'] ?? '',
		'email' => $_SESSION['participante_email'] ?? ''
	] : []
]);
?>
