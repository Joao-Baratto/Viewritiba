async function valida_sessao(){
    try {
        const retorno = await fetch("valida_sessao.php");
        const resposta = await retorno.json();
        if(resposta.status == "nok"){
            window.location.href = '../crud_organizador/home/MainMenu.html';
        }
    } catch (erro) {
        window.location.href = '../crud_organizador/home/MainMenu.html';
    }
}
