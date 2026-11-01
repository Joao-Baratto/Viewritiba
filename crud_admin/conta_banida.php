<?php
session_start();
$aviso = $_SESSION['aviso_banimento'] ?? null;

if (!is_array($aviso)) {
    header('Location: ../crud_participante/login/login.html');
    exit;
}

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conta suspensa | Viewritiba</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <header class="page-header">
        <div class="header-content">
            <a href="../crud_organizador/home/MainMenu.html" class="brand-link">
                <h1>Viewritiba</h1>
            </a>
            <p>Informações sobre a conta</p>
        </div>
    </header>
    <main class="page-main">
        <section class="form-container">
            <div class="form-header">
                <h2>Conta suspensa</h2>
                <p><?= htmlspecialchars($aviso['aviso_padrao'], ENT_QUOTES, 'UTF-8') ?></p>
            </div>
            <div class="ban-reason">
                <h3>Informação da equipe de moderação</h3>
                <p><?= nl2br(htmlspecialchars($aviso['motivo'], ENT_QUOTES, 'UTF-8')) ?></p>
                <small>Suspensão aplicada em <?= htmlspecialchars($aviso['banido_em'], ENT_QUOTES, 'UTF-8') ?></small>
            </div>
            <div class="form-footer">
                <a href="../crud_organizador/home/MainMenu.html">Voltar ao início</a>
            </div>
        </section>
    </main>
</body>
</html>
