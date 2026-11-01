async function valida_sessao() {
    try {
        const retorno = await fetch("../php/valida_sessao.php");
        const resposta = await retorno.json();
        if (resposta.status === "banido") {
            window.location.replace(resposta.redirect);
            return;
        }
        if (resposta.status !== "ok") {
            window.location.href = "../../crud_organizador/login/Login.html";
        }
    } catch (erro) {
        console.error("Não foi possível validar a sessão do organizador:", erro);
        alert("Não foi possível validar sua sessão. Tente novamente.");
    }
}

document.addEventListener("DOMContentLoaded", valida_sessao);