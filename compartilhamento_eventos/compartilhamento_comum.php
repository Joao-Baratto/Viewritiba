<?php
// Funções usadas pelos endpoints de compartilhamento.
// Fica na pasta favoritos/, junto dos outros arquivos PHP.
 
// AJUSTE se o conexao.php estiver em outro lugar (é o mesmo que os favoritos já usam)
include_once(__DIR__ . '/../crud_evento/php/conexao.php');
 
// Faz o mysqli lançar exceção em caso de erro (em vez de devolver false em silêncio).
// Assim o try/catch dos endpoints funciona igual em qualquer versão do PHP.
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
 
// Envia a resposta em JSON, com o código HTTP certo, e encerra o script.
function responder($codigo_http, $corpo) {
    http_response_code($codigo_http);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($corpo);
    exit;
}
 
// Só aceita o método esperado (POST ou GET). Qualquer outro retorna 405.
function exigir_metodo($metodo) {
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        header('Allow: ' . $metodo);
        responder(405, ['status' => 'nok', 'mensagem' => 'Método não permitido.']);
    }
}
 
// Descobre quem está logado.
// IMPORTANTE: se o login do grupo guarda o usuário de outro jeito na sessão,
// ajuste SOMENTE esta função, e os endpoints continuam funcionando.
function id_usuario_logado() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return $_SESSION['usuario'][0]['id_usuario'] ?? null;
}