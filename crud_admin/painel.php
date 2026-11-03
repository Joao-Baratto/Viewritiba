<?php
session_start();

if (($_SESSION['papel'] ?? '') !== 'moderador') {
    header('Location: ../crud_organizador/login/Login.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel de moderação | Viewritiba</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <header class="page-header">
        <div class="header-content">
            <h1>Viewritiba</h1>
            <div class="moderator-header">
                <span id="nome-moderador"><?= htmlspecialchars($_SESSION['moderador_nome'], ENT_QUOTES, 'UTF-8') ?></span>
                <button type="button" id="btn-sair" class="btn-secondary">Sair</button>
            </div>
        </div>
    </header>
    <main class="container moderator-main">
        <section class="moderation-section">
            <div class="moderation-heading">
                <div>
                    <h2>Moderação de eventos</h2>
                    <p>Exclua eventos que violem as regras. A exclusão também remove seus comentários.</p>
                </div>
                <button type="button" id="atualizar" class="btn-secondary">Atualizar</button>
            </div>
            <p id="mensagem-eventos" class="admin-message" role="status"></p>
            <div id="lista-eventos" class="moderation-list"></div>
        </section>
        <section class="moderation-section">
            <div class="moderation-heading">
                <div>
                    <h2>Moderação de comentários</h2>
                    <p>Remova comentários indevidos sem excluir o evento.</p>
                </div>
            </div>
            <p id="mensagem-comentarios" class="admin-message" role="status"></p>
            <div id="lista-comentarios" class="moderation-list"></div>
        </section>
        <section class="moderation-section">
            <div class="moderation-heading">
                <div>
                    <h2>Moderação de contas</h2>
                    <p>Suspenda organizadores ou participantes e informe o motivo que será exibido na tentativa de login. A suspensão pode ser removida por um moderador.</p>
                </div>
            </div>
            <p id="mensagem-contas" class="admin-message" role="status"></p>
            <div id="lista-contas" class="moderation-list"></div>
        </section>
    </main>
    <script src="js/painel.js?v=3"></script>
</body>
</html>
