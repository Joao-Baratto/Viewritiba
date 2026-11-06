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
    buscar();
});

async function logoff() {
    const retorno = await fetch("../php/participante_logoff.php");
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        window.location.href = "../home/MainMenu.html?v=2";
    }
}

async function buscar() {
    const retornoCategorias = await fetch("../../crud_evento/php/categoria_get.php");
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
        pesquisar();
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
        html += `
            <tr class="${tabela[i].favoritado ? "favoritado" : ""}">
                <td>${tabela[i].titulo}</td>
                <td>${tabela[i].descricao}</td>
                <td>${tabela[i].data_hora}</td>
                <td>${tabela[i].local}</td>
                <td>${tabela[i].organizador ?? "Organizador indisponível"}</td>
                <td>${tabela[i].categorias}</td>

                <td>
                    <a href="../../crud_comentarios/home/comentarios.html?id=${tabela[i].id}">
                        Comentários
                    </a>

                    ${tabela[i].favoritado ? "" : `
                    <a href="#"
                        onclick="favoritar_evento(${tabela[i].id}); return false;">
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