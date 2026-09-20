const parametros = new URLSearchParams(window.location.search);
const id_comentario = parametros.get("id");
const id_evento = parametros.get("id_evento");
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_voltar").addEventListener("click", (e) => {
        e.preventDefault();
        voltar();
    });
    document.getElementById("form_alterar_comentario").addEventListener("submit", (e) => {
        e.preventDefault();
        alterar();
    });
    buscar();
});
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
