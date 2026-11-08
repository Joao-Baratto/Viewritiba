document.addEventListener("DOMContentLoaded", () => {
    buscar();
});

document.getElementById("logoff").addEventListener("click", () => {
    logoff();
});

document.getElementById("buscar").addEventListener("click", () => {
    pesquisar();
});

document.getElementById("pesquisa").addEventListener("keydown", (evento) => {
    if (evento.key == "Enter") {
        evento.preventDefault();
        pesquisar();
    }
});

document.getElementById("filtro_apagar").addEventListener("click", () => {
    document.getElementById("pesquisa").value = "";
    document.getElementById("filtro_data").value = "";
    document.getElementById("filtro_categoria").value = "";
    buscar();
});

document.getElementById("fechar-detalhes-evento").addEventListener("click", fecharDetalhesEvento);
document.getElementById("fechar-detalhes-secundario").addEventListener("click", fecharDetalhesEvento);
document.getElementById("modal-detalhes-evento").addEventListener("click", (evento) => {
    if (evento.target === evento.currentTarget) {
        fecharDetalhesEvento();
    }
});

async function logoff() {
    try {
        const retorno = await fetch("../php/participante_logoff.php", {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const resposta = await retorno.json();

        if (retorno.ok && resposta.status === "ok") {
            window.location.href = "../home/MainMenu.html";
        } else {
            alert(resposta.mensagem || "Não foi possível sair da conta.");
        }
    } catch (erro) {
        console.error("Erro ao sair:", erro);
        alert("Não foi possível encerrar a sessão.");
    }
}

async function buscar() {
    const retornoCategorias = await fetch("../php/categoria_get.php");
    const categorias = await retornoCategorias.json();

    if (categorias.status == "ok") {
        var html = `<option value="">Todas as categorias</option>`;

        for (var i = 0; i < categorias.data.length; i++) {
            html += `<option value="${categorias.data[i].id_categoria}">${categorias.data[i].nome_categoria}</option>`;
        }

        document.getElementById("filtro_categoria").innerHTML = html;
    }

    const retorno = await fetch("../php/eventos_get.php");
    const resposta = await retorno.json();
    if (resposta.status == "banido") {
        window.location.replace(resposta.redirect);
        return;
    }
    if (retorno.status == 401) {
        window.location.href = "../login/login.html";
        return;
    }

    if (resposta.status == "ok") {
        preencherTabela(resposta.data);
    } else {
        document.getElementById("lista").innerHTML =
            "<p>Nenhum evento cadastrado.</p>";
    }
}

async function pesquisar() {
    const titulo = document.getElementById("pesquisa").value.trim();
    const data = document.getElementById("filtro_data").value;
    const categoria = document.getElementById("filtro_categoria").value;

    const parametros = new URLSearchParams();

    if (titulo != "") {
        parametros.append("titulo", titulo);
    }

    if (categoria != "") {
        parametros.append("categoria", categoria);
    }

    var url = "../php/eventos_get.php?" + parametros.toString();

    const retorno = await fetch(url);
    const resposta = await retorno.json();
    if (resposta.status == "banido") {
        window.location.replace(resposta.redirect);
        return;
    }
    if (retorno.status == 401) {
        window.location.href = "../login/login.html";
        return;
    }

    if (resposta.status == "ok") {
        var eventos = resposta.data;

        if (data != "") {
            eventos = eventos.filter((evento) => {
                return evento.data_hora.substring(0, 10) == data;
            });
        }

        if (eventos.length > 0) {
            preencherTabela(eventos);
        } else {
            document.getElementById("lista").innerHTML =
                "<p>Nenhum evento encontrado.</p>";
        }
    } else {
        document.getElementById("lista").innerHTML =
            "<p>Nenhum evento encontrado.</p>";
    }
}

async function favoritar_evento(id_evento) {
    const dados = new FormData();
    dados.set("evento_id", id_evento);

    try {
        const retorno = await fetch("../../favoritos/favoritos_add.php", {
            method: "POST",
            body: dados
        });
        const resposta = await retorno.json();

        if (!retorno.ok || resposta.status !== "ok") {
            throw new Error(resposta.mensagem || "Não foi possível favoritar este evento.");
        }

        alert(resposta.mensagem);
        pesquisar();
    } catch (erro) {
        console.error("Erro ao favoritar evento:", erro);
        alert(erro.message || "Não foi possível favoritar este evento. Tente novamente.");
    }
}

let eventosExibidos = [];

function preencherTabela(tabela) {
    eventosExibidos = tabela;

    var html = `
        <table>
            <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th>Data e Hora</th>
                <th>Local</th>
                <th>Organizador</th>
                <th>Categorias</th>
                <th>Ações</th>
            </tr>
    `;

    for (var i = 0; i < tabela.length; i++) {
        const evento = tabela[i];
        const idEvento = Number(evento.id);
        html += `
            <tr class="${evento.favoritado ? "favoritado" : ""}">
                <td>${escaparHtml(evento.titulo)}</td>
                <td>${escaparHtml(evento.descricao)}</td>
                <td>${escaparHtml(evento.data_hora)}</td>
                <td>${escaparHtml(evento.local)}</td>
                <td>${escaparHtml(evento.organizador || "Organizador indisponível")}</td>
                <td>${escaparHtml(evento.categorias)}</td>

                <td>
                    <a href="../../crud_comentarios/home/comentarios.html?id=${encodeURIComponent(idEvento)}">
                        Comentários
                    </a>

                    <button type="button" class="btn-detalhes" onclick="abrirDetalhesEvento(${i})">
                        Detalhes
                    </button>

                    ${evento.favoritado ? "" : `
                    <a href="#"
                        onclick="favoritar_evento(${idEvento}); return false;">
                        Favoritar
                    </a>`}

                    <button type="button" class="btn-compartilhar" onclick="abrirCompartilhamento(${i})">Compartilhar</button>
                </td>
            </tr>
        `;
    }

    html += "</table>";

    document.getElementById("lista").innerHTML = html;
}

function abrirDetalhesEvento(indice) {
    const evento = eventosExibidos[indice];
    if (!evento) {
        return;
    }

    const modal = document.getElementById("modal-detalhes-evento");
    const dataEvento = new Date(String(evento.data_hora || "").replace(" ", "T"));
    const dataFormatada = Number.isNaN(dataEvento.getTime())
        ? evento.data_hora
        : new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long",
            timeStyle: "short"
        }).format(dataEvento);

    document.getElementById("detalhes-titulo").textContent = evento.titulo || "Evento sem título";
    document.getElementById("detalhes-descricao").textContent = evento.descricao || "Descrição não informada.";
    document.getElementById("detalhes-data").textContent = dataFormatada || "Data não informada.";
    document.getElementById("detalhes-local").textContent = evento.local || "Local não informado.";
    document.getElementById("detalhes-organizador").textContent = evento.organizador || "Organizador indisponível.";
    document.getElementById("detalhes-categorias").textContent = evento.categorias || "Não informadas.";
    document.getElementById("detalhes-comentarios").href =
        `../../crud_comentarios/home/comentarios.html?id=${encodeURIComponent(evento.id)}`;

    modal.showModal();
}

function fecharDetalhesEvento() {
    document.getElementById("modal-detalhes-evento").close();
}

function escaparHtml(valor) {
    const elemento = document.createElement("span");
    elemento.textContent = valor ?? "";
    return elemento.innerHTML;
}

function abrirCompartilhamento(indice) {
    const evento = eventosExibidos[indice];

    if (!evento) {
        alert("Evento não encontrado.");
        return;
    }

    if (typeof compartilharEvento !== "function") {
        console.error("A função compartilharEvento não foi carregada.");
        alert("O sistema de compartilhamento não foi carregado.");
        return;
    }

    compartilharEvento({
        id_evento: evento.id,
        titulo: evento.titulo,
        descricao: evento.descricao,
        data_hora: evento.data_hora,
        local: evento.local
    });
}