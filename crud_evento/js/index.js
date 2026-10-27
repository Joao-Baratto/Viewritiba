document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    buscar();
});

document.getElementById("novo").addEventListener("click", () => {
    window.location.href = "evento_novo.html";
});

document.getElementById("logoff").addEventListener("click", () => {
    logoff();
});

document.getElementById("buscar").addEventListener("click", () => {
    pesquisar();
});

document.getElementById("pesquisa").addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        evento.preventDefault();
        pesquisar();
    }
});

document.getElementById("pesquisa").addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        evento.preventDefault();
        pesquisar();
    }
});

document.getElementById("filtro_data").addEventListener("change", () => {
    pesquisar();
});

document.getElementById("filtro_apagar").addEventListener("click", () => {
    document.getElementById("pesquisa").value = "";
    document.getElementById("filtro_data").value = "";
    buscar();
});

async function logoff() {
    const retorno = await fetch("../php/evento_logoff.php");
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        window.location.href = "../login/";
    }
}

async function buscar() {
    const retorno = await fetch("../php/evento_get.php");
    const resposta = await retorno.json();

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

    var url = "../php/evento_get.php";

    if (titulo != "") {
        url += "?titulo=" + encodeURIComponent(titulo);
    }

    const retorno = await fetch(url);
    const resposta = await retorno.json();

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

async function excluir(id) {
    const confirmacao = confirm(
        "Tem certeza que deseja excluir este evento?"
    );

    if (confirmacao == false) {
        return;
    }

    const retorno = await fetch(
        "../php/evento_excluir.php?id=" + id
    );

    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        alert(resposta.mensagem);
        buscar();
    } else {
        alert(resposta.mensagem);
    }
}

function preencherTabela(tabela) {
    var html = `
        <table>
            <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th>Data e Hora</th>
                <th>Local</th>
                <th>ID Organizador</th>
                <th>Ações</th>
            </tr>
    `;

    for (var i = 0; i < tabela.length; i++) {
        html += `
            <tr>
                <td>${tabela[i].titulo}</td>
                <td>${tabela[i].descricao}</td>
                <td>${tabela[i].data_hora}</td>
                <td>${tabela[i].local}</td>
                <td>${tabela[i].id_organizador}</td>

                <td>
                    <a href="../../crud_comentarios/home/comentarios.html?id=${tabela[i].id_evento}">
                        Comentários
                    </a>

                    <a href="evento_alterar.html?id=${tabela[i].id_evento}">
                        Alterar
                    </a>

                    <a href="#"
                        onclick="favoritar_evento(${tabela[i].id_evento}); return false;">
                        Favoritar
                    </a>

                    <a href="#"
                        onclick="excluir(${tabela[i].id_evento}); return false;">
                        Excluir
                    </a>
                </td>
            </tr>
        `;
    }

    html += "</table>";

    document.getElementById("lista").innerHTML = html;
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
}