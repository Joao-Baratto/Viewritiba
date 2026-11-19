let comboFiltro = null;

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
    if (comboFiltro) comboFiltro.limpar();
    buscar();
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
    let categorias = { status: "erro", data: [] };
    try {
        const retornoCategorias = await fetch("../php/categoria_get.php");
        categorias = await retornoCategorias.json();
    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
    }

    if (comboFiltro == null) {
        comboFiltro = new ComboCategorias(
            document.getElementById("filtro_categorias"),
            categorias.status == "ok" ? categorias.data : [],
            { placeholder: "Todas as categorias", unica: true }
        );
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
    const categoria = comboFiltro ? comboFiltro.valores().join(",") : "";

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

async function desfavoritar_evento(id_evento) {
    const dados = new FormData();
    dados.set("evento_id", id_evento);

    try {
        const retorno = await fetch("../../favoritos/favoritos_remover.php", {
            method: "POST",
            body: dados
        });
        const resposta = await retorno.json();

        if (!retorno.ok || resposta.status !== "ok") {
            throw new Error(resposta.mensagem || "Não foi possível desfavoritar este evento.");
        }

        alert(resposta.mensagem);
        pesquisar();
    } catch (erro) {
        console.error("Erro ao desfavoritar evento:", erro);
        alert(erro.message || "Não foi possível desfavoritar este evento. Tente novamente.");
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
                <td>${marcadorLink(evento)}${escaparHtml(evento.titulo)}</td>
                <td>${escaparHtml(evento.descricao)}</td>
                <td>${escaparHtml(evento.data_hora)}</td>
                <td>${escaparHtml(evento.local)}</td>
                <td>${escaparHtml(evento.organizador || "Organizador indisponível")}</td>
                <td>${escaparHtml(evento.categorias)}</td>

                <td>
                    <a class="btn-icone" title="Comentários" aria-label="Comentários"
                        href="../../crud_comentarios/home/comentarios.html?id=${encodeURIComponent(idEvento)}">
                        ${icone("comentarios")}
                    </a>

                    <a class="btn-detalhes btn-icone" title="Detalhes" aria-label="Detalhes"
                        href="../../crud_evento/home/visualizar_evento.html?id=${encodeURIComponent(idEvento)}">
                        ${icone("info")}
                    </a>

                    ${evento.favoritado ? `
                    <a class="btn-icone" title="Desfavoritar" aria-label="Desfavoritar" href="#"
                        onclick="desfavoritar_evento(${idEvento}); return false;">
                        ${icone("desfavoritar")}
                    </a>` : `
                    <a class="btn-icone" title="Favoritar" aria-label="Favoritar" href="#"
                        onclick="favoritar_evento(${idEvento}); return false;">
                        ${icone("favoritar")}
                    </a>`}

                </td>
            </tr>
        `;
    }

    html += "</table>";

    document.getElementById("lista").innerHTML = html;
}


function escaparHtml(valor) {
    const elemento = document.createElement("span");
    elemento.textContent = valor ?? "";
    return elemento.innerHTML;
}
