<?php
function usuario_logado()
{
    if (isset($_SESSION['organizador_id'])) {
        return [
            'tipo' => 'organizador',
            'id' => (int) $_SESSION['organizador_id'],
            'nome' => $_SESSION['organizador_nome'] ?? ''
        ];
    }
    if (isset($_SESSION['participante_id'])) {
        return [
            'tipo' => 'participante',
            'id' => (int) $_SESSION['participante_id'],
            'nome' => $_SESSION['participante_nome'] ?? ''
        ];
    }
    return null;
}
