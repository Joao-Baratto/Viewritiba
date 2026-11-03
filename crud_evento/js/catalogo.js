let eventosPublicos = [];

document.addEventListener("DOMContentLoaded", carregarEventosPublicos);
document.getElementById("pesquisa-eventos").addEventListener("input", renderizarEventos);

async function carregarEventosPublicos() {
    const mensagem = document.getElementById("mensagem-catalogo");
    mensagem.textContent = "Carregando eventos...";

    try {
        const response = await fetch("../php/eventos_publicos.php");
        const result = await response.json();
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível carregar os eventos.");
        }

        eventosPublicos = result.data;
        mensagem.textContent = "";
        renderizarEventos();
    } catch (error) {
        mensagem.textContent = error.message;
    }
}

function renderizarEventos() {
    const container = document.getElementById("lista-eventos");
    const mensagem = document.getElementById("mensagem-catalogo");
    const termo = document.getElementById("pesquisa-eventos").value.trim().toLocaleLowerCase();
    const filtrados = eventosPublicos.filter((evento) => {
        const campos = [evento.titulo, evento.local, evento.organizador];
        return campos.some((campo) => campo.toLocaleLowerCase().includes(termo));
    });

    container.replaceChildren();
    if (filtrados.length === 0) {
        mensagem.textContent = eventosPublicos.length === 0
            ? "Ainda não há eventos publicados."
            : "Nenhum evento corresponde à pesquisa.";
        return;
    }

    mensagem.textContent = "";
    filtrados.forEach((evento) => {
        const card = document.createElement("article");
        card.className = "public-event-card";
        card.append(criarTexto("h3", evento.titulo));
        card.append(criarTexto("p", `Organizador: ${evento.organizador}`));
        card.append(criarTexto("p", `${evento.data_hora} · ${evento.local}`));
        card.append(criarTexto("p", evento.descricao, "event-description"));

        const link = document.createElement("a");
        link.className = "btn-primary";
        link.href = `visualizar_evento.html?id=${encodeURIComponent(evento.id)}`;
        link.textContent = "Ver comentários";
        card.append(link);
        container.append(card);
    });
}

function criarTexto(tag, texto, className = "") {
    const element = document.createElement(tag);
    element.textContent = texto;
    if (className) {
        element.className = className;
    }
    return element;
}
