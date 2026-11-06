const parametros = new URLSearchParams(window.location.search);
const id_comentario = parametros.get("id");
const id_evento = parametros.get("id_evento");
let tipo_conta = "";
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_voltar").addEventListener("click", (e) => {
        e.preventDefault();
        voltar();
    });
    document.getElementById("form_alterar_comentario").addEventListener("submit", (e) => {
        e.preventDefault();
        alterar();
    });
    ajustar_links_participante();
    buscar();
});
// Mostra o menu de quem está logado (participante ou organizador) e aponta o logo para o painel dele
async function ajustar_links_participante() {
    try {
        const resposta = await fetch("../php/valida_sessao.php");
        const retorno = await resposta.json();
        tipo_conta = (retorno.data && retorno.data.tipo) || "";
    } catch (erro) {}
    const menu = document.getElementById("menu_" + tipo_conta);
    if (!menu) return;
    menu.hidden = false;
    document.getElementById("logo").href = menu.dataset.painel;
}
async function deslogar() {
    const retorno = await fetch("../php/deslogar.php");
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        if (tipo_conta === "participante") {
            window.location.replace("../../crud_participante/home/MainMenu.html?v=2");
        } else {
            window.location.replace("../../crud_organizador/home/MainMenu.html?v=2");
        }
    }
}
async function buscar() {
    if (!id_comentario) {
        alert("Comentário inválido.");
        voltar();
        return;
    }
    try {
        const resposta = await fetch(`../php/comentario_get_um.php?id_comentario=${id_comentario}`);
        const retorno = await resposta.json();
        if (retorno.status == "ok") {
            document.getElementById("novo_comentario").value = retorno.data[0].texto || "";
            document.getElementById("nova_nota").value = retorno.data[0].nota || "";
        } else {
            alert(retorno.mensagem_retorno);
            voltar();
        }
    } catch (erro) {
        alert("Não foi possível carregar o comentário.");
        voltar();
    }
}
async function alterar() {
    const comentario = document.getElementById("novo_comentario").value.trim();
    const nota = Number(document.getElementById("nova_nota").value);
    if (!comentario) {
        alert("Por favor, escreva um comentário.");
        return;
    }
    if (!nota) {
        alert("Escolha uma nota de 1 a 5.");
        return;
    }
    const fd = new FormData();
    fd.append("id_comentario", id_comentario);
    fd.append("texto", comentario);
    fd.append("nota", nota);
    try {
        const resposta = await fetch(`../php/comentario_alterar.php?id_comentario=${id_comentario}`, {
            method: "POST",
            body: fd
        });
        const retorno = await resposta.json();
        if (retorno.status == "ok") {
            alert("Comentário alterado com sucesso!");
            voltar();
        } else {
            alert(retorno.mensagem_retorno);
        }
    } catch (erro) {
        alert("Não foi possível alterar o comentário.");
    }
}
function voltar() {
    window.location.href = `comentarios.html?id=${id_evento}`;
    alert("Voltando para os comentários do evento...");
}
