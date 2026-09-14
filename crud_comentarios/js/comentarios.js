let comentarios = [];
let elementos_tela;
const parametros = new URLSearchParams(window.location.search);
const id_evento = parametros.get("id");

document.addEventListener("DOMContentLoaded", () => {
    elementos_tela = document.getElementById("elementos_tela");
    const btn_voltar = document.getElementById("btn_voltar");
    const btn_comentario = document.getElementById("btn_comentario");

    if (!id_evento) {
        alert("Evento inválido.");
        window.location.href = "../../crud_evento/home/index.html";
        return;
    }

    if (btn_voltar) {
        btn_voltar.addEventListener("click", (e) => {
            e.preventDefault();
            voltar();
        });
    }

    if (btn_comentario) {
        btn_comentario.addEventListener("click", (e) =>{
            e.preventDefault();
            enviar();
        });
    }

    carregar_comentarios();
});

async function enviar() {
    const campoComentario = document.getElementById("new_comentario");
    const conteudo = campoComentario.value.trim();
    const nota = document.getElementById("new_nota").value;

    if (!conteudo) {
        alert("Por favor, escreva um comentário.");
        return;
    }
    const fd = new FormData();
    fd.append("texto", conteudo);
    fd.append("id_evento", id_evento);
    fd.append("nota", nota);

    try {
        const resposta = await fetch("../../crud_comentarios/php/comentario_nova.php", {
            method: "POST",
            body: fd
        });
        const retorno = await resposta.json();

        if (retorno.status === "ok") {
            campoComentario.value = "";
            document.getElementById("new_nota").value = "";
            carregar_comentarios();
        } else {
            alert("Erro ao inserir comentário: " + retorno.mensagem_retorno);
        }
    } catch (erro) {
        alert("Não foi possível enviar o comentário.");
    }
}

async function carregar_comentarios() {
    try {
        const resposta = await fetch(`../../crud_comentarios/php/comentario_get.php?id_evento=${id_evento}`);
        const retorno = await resposta.json();
        comentarios = retorno.status === "ok" ? (retorno.data || []) : [];
        renderizar_comentarios();
    } catch (erro) {
        elementos_tela.innerHTML = "<p>Não foi possível carregar os comentários.</p>";
    }
}

function renderizar_comentarios() {
    elementos_tela.innerHTML = "";
    comentarios.forEach(comentario => {
        elementos_tela.innerHTML += `<div>
            <small>${comentario.data_criacao}</small>
            <h2>${comentario.nome_usuario}</h2>
            <p>${comentario.texto}</p>
            <p>Nota: ${comentario.nota}/5</p>
            <button type="button" onclick="alterar_comentario(${comentario.id})">Alterar</button>
            <button type="button" onclick="excluir_comentario(${comentario.id})">Excluir</button>
        </div><hr>`;
    });
}

function alterar_comentario(id_comentario) {
    window.location.href = `../../crud_comentarios/home/alterar_comentario.html?id=${id_comentario}`;
}

async function excluir_comentario(id_comentario) {
    if (!confirm("Deseja excluir este comentário?")) {
        return;
    }

    try {
        const resposta = await fetch(`../../crud_comentarios/php/comentario_excluir.php?id_comentario=${id_comentario}`, {
            method: "DELETE"
        });
        const retorno = await resposta.json();

        if (retorno.status === "ok") {
            carregar_comentarios();
        } else {
            alert("Erro ao excluir comentário: " + retorno.mensagem_retorno);
        }
    } catch (erro) {
        alert("Não foi possível excluir o comentário.");
    }
}

function voltar() {
    window.location.href = "../../crud_evento/home/index.html";
}