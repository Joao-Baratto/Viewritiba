<?php

session_start();
$_SESSION = [];
session_destroy();

header("Location: ../login/login.html");
exit;
=======
<?php
    session_start();
    session_unset();
    session_destroy();
    $retorno = [
        'status'    => 'ok',
        'mensagem'  => '',
        'data'      => []
    ];
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
