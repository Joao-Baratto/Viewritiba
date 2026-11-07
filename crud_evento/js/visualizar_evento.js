const parametros = new URLSearchParams(window.location.search);
const id_evento = parametros.get("id");
let tipo_conta = "";

document.addEventListener("DOMContentLoaded", () => {
    mostrarMenu();
    carregarEvento();
});

document.getElementById("btn_voltar").addEventListener("click", () => {
    voltar();
});

document.getElementById("btn_favoritar").addEventListener("click", () => {
    favoritar_evento();
});

async function mostrarMenu() {
    try {
        const retorno = await fetch("../../crud_comentarios/php/valida_sessao.php");
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            tipo_conta = resposta.data.tipo;
        }
    } catch (erro) {
        console.error("Não foi possível validar a sessão:", erro);
    }

    const menu = document.getElementById("menu_" + (tipo_conta || "visitante"));
    menu.hidden = false;

    if (menu.dataset.painel) {
        document.getElementById("logo").href = menu.dataset.painel;
    }
}

async function carregarEvento() {
    if (!id_evento) {
        mostrarErro("Evento inválido.");
        return;
    }

    try {
        const retorno = await fetch("../php/evento_detalhe.php?id=" + id_evento);
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            preencherDetalhes(resposta.data);
        } else {
            mostrarErro(resposta.mensagem);
        }
    } catch (erro) {
        console.error("Não foi possível carregar o evento:", erro);
        mostrarErro("Não foi possível carregar o evento.");
    }
}

function preencherDetalhes(evento) {
    const dataEvento = new Date(evento.data_hora.replace(" ", "T"));
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeStyle: "short"
    }).format(dataEvento);

    document.title = evento.titulo + " | Viewritiba";
    document.getElementById("detalhes-titulo").textContent = evento.titulo;
    document.getElementById("detalhes-descricao").textContent = evento.descricao ?? "Descrição não informada.";
    document.getElementById("detalhes-data").textContent = dataFormatada;
    document.getElementById("detalhes-local").textContent = evento.local;
    document.getElementById("detalhes-organizador").textContent = evento.organizador ?? "Organizador indisponível";
    document.getElementById("detalhes-categorias").textContent = evento.categorias ?? "Não informadas.";
    document.getElementById("detalhes-comentarios").href =
        "../../crud_comentarios/home/comentarios.html?id=" + evento.id;

    if (evento.pode_favoritar && !evento.favoritado) {
        document.getElementById("btn_favoritar").hidden = false;
    }
}

function mostrarErro(mensagem) {
    document.getElementById("detalhes-titulo").textContent = mensagem;
    document.getElementById("detalhes-info").style.display = "none";
    document.getElementById("detalhes-comentarios").style.display = "none";
}

async function favoritar_evento() {
    const dados = new FormData();

    dados.append("evento_id", id_evento);

    const retorno = await fetch(
        "../../favoritos/favoritos_add.php",
        {
            method: "POST",
            body: dados
        }
    );

    const resposta = await retorno.json();

    alert(resposta.mensagem);

    if (resposta.status == "ok") {
        document.getElementById("btn_favoritar").hidden = true;
    }
}

function voltar() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "../../index.html";
    }
}

async function sair() {
    if (tipo_conta == "organizador") {
        await fetch("../php/evento_logoff.php");
        window.location.href = "../../crud_organizador/home/MainMenu.html?v=2";
    } else {
        await fetch("../../crud_participante/php/participante_logoff.php");
        window.location.href = "../../crud_participante/home/MainMenu.html?v=2";
    }
}
