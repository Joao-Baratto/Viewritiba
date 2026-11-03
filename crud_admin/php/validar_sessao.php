<?php
require_once __DIR__ . '/proteger_admin.php';
exigir_moderador();

echo json_encode([
    'status' => 'ok',
    'nome' => $_SESSION['moderador_nome'],
    'csrf_token' => $_SESSION['moderador_csrf']
]);
