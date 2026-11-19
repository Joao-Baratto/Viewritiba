document.addEventListener("DOMContentLoaded", () => {
    carregarEventos();
});

function dados(i) {
    const div = document.createElement("div");
    div.textContent = i ?? "";
    return div.innerHTML;
}

async function carregarEventos() {
    const mensagem = document.getElementById("mensagem_explorar");
    const titulo = document.getElementById("titulo_explorar");
    const topo = document.querySelector(".explorar-topo");
    titulo.textContent = "Eventos Recomendados";
    mensagem.textContent = "Carregando eventos...";
    mensagem.style.whiteSpace = 'pre-wrap';
    const card = document.getElementById("card_explorar");
    const linkTodos = document.getElementById("link_todos_eventos");
    topo.classList.remove("sem-recomendacao");
    card.hidden = true;
    linkTodos.hidden = true;

    try {
        const retorno = await fetch("../php/explorar_get.php");
        const resposta = await retorno.json();

        if (resposta.status == "ok" && resposta.data.length > 0) {
            titulo.textContent = "Eventos Recomendados";
            mensagem.textContent = "Selecionados a partir das categorias dos seus favoritos.";
            linkTodos.hidden = false;
            preencherTabela(resposta.data);
        } else {
            titulo.textContent = "Nenhum Evento Recomendado";
            topo.classList.add("sem-recomendacao");
            card.hidden = false;
            document.getElementById("lista-explorar").innerHTML = "";
            mensagem.textContent = "Voce não possui recomendaçoes de Evento.\nPara receber recomendações favorite um Evento.";
        }
    } catch (erro) {
        console.error("Não foi possível carregar os eventos:", erro);
        mensagem.textContent = "Não foi possível carregar os eventos...";
    }
}

function preencherTabela(tabela) {
    var html = `
        <table>
            <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th>Data</th>
                <th>Local</th>
                <th>Organizador</th>
                <th>Nota</th>
                <th>Ações</th>
            </tr>
    `;

    for (var i = 0; i < tabela.length; i++) {
        html += `
            <tr class="${tabela[i].favoritado ? "favoritado" : ""}">
                <td>${marcadorLink(tabela[i])}${dados(tabela[i].titulo)}</td>
                <td>${dados(tabela[i].descricao)}</td>
                <td>${dados(tabela[i].data_hora)}</td>
                <td>${dados(tabela[i].local)}</td>
                <td>${dados(tabela[i].organizador)}</td>
                <td>${tabela[i].nota_media == null ? "-" : dados(tabela[i].nota_media) + "★"}</td>
                <td>
                    <a class="btn-icone" title="Comentários" aria-label="Comentários"
                        href="../../crud_comentarios/home/comentarios.html?id=${tabela[i].id}">
                        ${icone("comentarios")}
                    </a>

                    <a class="btn-detalhes btn-icone" title="Detalhes" aria-label="Detalhes"
                        href="../../crud_evento/home/visualizar_evento.html?id=${tabela[i].id}">
                        ${icone("info")}
                    </a>

                    ${tabela[i].favoritado ? `
                    <a class="btn-icone" title="Desfavoritar" aria-label="Desfavoritar" href="#"
                        onclick="desfavoritar_evento(${tabela[i].id}); return false;">
                        ${icone("desfavoritar")}
                    </a>` : `
                    <a class="btn-icone" title="Favoritar" aria-label="Favoritar" href="#"
                        onclick="favoritar_evento(${tabela[i].id}); return false;">
                        ${icone("favoritar")}
                    </a>`}

                </td>
            </tr>
        `;
    }

    html += "</table>";

    document.getElementById("lista-explorar").innerHTML = html;
}


async function desfavoritar_evento(id_evento) {
    const dados = new FormData();

    dados.append("evento_id", id_evento);

    const retorno = await fetch(
        "../../favoritos/favoritos_remover.php",
        {
            method: "POST",
            body: dados
        }
    );

    const resposta = await retorno.json();

    alert(resposta.mensagem);

    if (resposta.status == "ok") {
        carregarEventos();
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
        carregarEventos();
    }
}
