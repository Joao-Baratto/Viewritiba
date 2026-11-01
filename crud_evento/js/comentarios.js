const parametrosComentario = new URLSearchParams(window.location.search);
const idEventoComentario = parametrosComentario.get("id");

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_voltar").addEventListener("click", () => {
        window.location.href = "catalogo.html";
    });
    document.getElementById("btn_comentario").addEventListener("click", enviarComentario);
    verificarSessaoParticipante();

    if (!idEventoComentario || !/^\d+$/.test(idEventoComentario)) {
        mostrarMensagem("Evento inválido.");
        document.getElementById("btn_comentario").disabled = true;
        return;
    }

    renderizarComentarios();
});

async function verificarSessaoParticipante() {
    const status = document.getElementById("comentario_acesso");
    try {
        const response = await fetch("../php/comentarios_sessao.php");
        const result = await response.json();
        if (result.status === "banido") {
            window.location.replace(result.redirect);
            return;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível verificar seu acesso.");
        }
        if (result.autenticado) {
            document.getElementById("btn_comentario").disabled = false;
            status.textContent = `Você está comentando como ${result.nome}.`;
            return;
        }

        status.textContent = "Entre como participante para publicar um comentário.";
        const link = document.createElement("a");
        link.href = "../../crud_participante/login/login.html";
        link.textContent = "Entrar";
        status.append(" ", link);
    } catch (error) {
        status.textContent = error.message;
    }
}

async function renderizarComentarios() {
    const container = document.getElementById("elementos_tela");
    container.replaceChildren();

    try {
        const response = await fetch(
            `../php/comentarios_get.php?id_evento=${encodeURIComponent(idEventoComentario)}`
        );
        const result = await response.json();
        if (result.status === "banido") {
            window.location.replace(result.redirect);
            return;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível carregar os comentários.");
        }

        if (result.data.length === 0) {
            container.append(criarTexto("p", "Ainda não há comentários neste evento."));
            return;
        }

        result.data.forEach((comentario) => {
            const card = document.createElement("article");
            card.append(criarTexto("small", comentario.data));
            card.append(criarTexto("h2", comentario.usuario));
            card.append(criarTexto("p", comentario.comentario));
            container.append(card);
        });
    } catch (error) {
        mostrarMensagem(error.message);
    }
}

async function enviarComentario() {
    const campo = document.getElementById("new_comentario");
    const texto = campo.value.trim();

    if (texto === "") {
        mostrarMensagem("Digite um comentário antes de enviar.");
        return;
    }

    const dados = new FormData();
    dados.set("id_evento", idEventoComentario);
    dados.set("comentario", texto);

    try {
        const response = await fetch("../php/comentarios_novo.php", {
            method: "POST",
            body: dados
        });
        const result = await response.json();
        if (result.status === "banido") {
            window.location.replace(result.redirect);
            return;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível publicar o comentário.");
        }

        campo.value = "";
        await renderizarComentarios();
        mostrarMensagem(result.mensagem);
    } catch (error) {
        mostrarMensagem(error.message);
    }
}

function criarTexto(tag, texto) {
    const element = document.createElement(tag);
    element.textContent = texto;
    return element;
}

function mostrarMensagem(mensagem) {
    const container = document.getElementById("elementos_tela");
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.textContent = mensagem;
    container.prepend(status);
}
