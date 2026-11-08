<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (!isset($_SESSION['organizador_id'])) {
    http_response_code(401);

    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Faça login como organizador para alterar eventos.',
        'data' => []
    ];

    echo json_encode($retorno);
    exit;
}

$id = (int) ($_GET['id'] ?? 0);
$titulo = trim($_POST['titulo'] ?? '');
$descricao = trim($_POST['descricao'] ?? '');
$data_hora = trim($_POST['data_hora'] ?? '');
$local = trim($_POST['local'] ?? '');
$categorias = $_POST['categorias'] ?? [];

if (
    $id < 1 ||
    $titulo === '' ||
    $descricao === '' ||
    $data_hora === '' ||
    $local === '' ||
    !is_array($categorias) ||
    count($categorias) == 0
) {
    http_response_code(400);

    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Informe um evento válido, preencha todos os campos e selecione pelo menos uma categoria.',
        'data' => []
    ];

    echo json_encode($retorno);
    exit;
}

$data_hora = str_replace('T', ' ', $data_hora);

if (strlen($data_hora) === 16) {
    $data_hora .= ':00';
}

// Confere se a data é válida e futura, considerando o horário de São Paulo.
$fuso = new DateTimeZone('America/Sao_Paulo');
$data_evento = DateTime::createFromFormat(
    '!Y-m-d H:i:s',
    $data_hora,
    $fuso
);
$erros_data = DateTime::getLastErrors();

$data_invalida =
    $data_evento === false ||
    ($erros_data !== false &&
        ($erros_data['warning_count'] > 0 || $erros_data['error_count'] > 0)) ||
    ($data_evento !== false &&
        $data_evento->format('Y-m-d H:i:s') !== $data_hora) ||
    ($data_evento !== false &&
        $data_evento <= new DateTime('now', $fuso));

if ($data_invalida) {
    http_response_code(400);

    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Informe uma data e um horário futuros válidos para o evento.',
        'data' => []
    ];

    echo json_encode($retorno);
    exit;
}

include_once('conexao.php');

$id_organizador = (int) $_SESSION['organizador_id'];

require_once __DIR__ . '/../../crud_admin/php/banimentos.php';
exigir_conta_nao_banida($conexao, 'organizador', $id_organizador);

// Confere se o evento pertence ao organizador conectado.
$stmt = $conexao->prepare(
    "SELECT id FROM evento WHERE id = ? AND id_organizador = ?"
);
$stmt->bind_param("ii", $id, $id_organizador);
$stmt->execute();

$encontrado = $stmt->get_result()->num_rows > 0;

$stmt->close();

if ($encontrado) {
    $stmt = $conexao->prepare("
        UPDATE evento
        SET titulo = ?, descricao = ?, data_hora = ?, local = ?
        WHERE id = ? AND id_organizador = ?
    ");

    $stmt->bind_param(
        "ssssii",
        $titulo,
        $descricao,
        $data_hora,
        $local,
        $id,
        $id_organizador
    );

    $stmt->execute();
    $stmt->close();

    // Apaga as categorias antigas do evento.
    $stmt_categoria = $conexao->prepare(
        "DELETE FROM evento_categoria WHERE id_evento = ?"
    );
    $stmt_categoria->bind_param("i", $id);
    $stmt_categoria->execute();
    $stmt_categoria->close();

    // Cadastra as categorias selecionadas.
    $stmt_categoria = $conexao->prepare(
        "INSERT INTO evento_categoria (id_evento, id_categoria) VALUES (?, ?)"
    );

    foreach ($categorias as $id_categoria) {
        $id_categoria = (int) $id_categoria;
        $stmt_categoria->bind_param("ii", $id, $id_categoria);
        $stmt_categoria->execute();
    }

    $stmt_categoria->close();

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Evento alterado com sucesso.',
        'data' => []
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'O evento não foi encontrado.',
        'data' => []
    ];
}

$conexao->close();
echo json_encode($retorno);