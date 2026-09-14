let eventos = [];
let elementos_tela;

document.addEventListener("DOMContentLoaded", () => {
    elementos_tela = document.getElementById("elementos_tela");
    document.getElementById("new_evento").addEventListener("click", novo_evento);
    document.getElementById("filtro_data").addEventListener("change", renderizar);
    document.getElementById("filtro_apagar").addEventListener("click", limpar_filtro);
    carregar_eventos();
});

async function carregar_eventos() {
    try {
        const resposta = await fetch("../php/evento_get.php");
        const retorno = await resposta.json();
        eventos = retorno.status === "ok" ? (retorno.data || []) : [];
        renderizar();
    } catch (erro) {
        elementos_tela.innerHTML = "<p>Não foi possível carregar os eventos.</p>";
    }
}

function renderizar() {
    const dataFiltro = document.getElementById("filtro_data").value;
    const eventosFiltrados = dataFiltro
        ? eventos.filter(evento => evento.data_hora.substring(0, 10) === dataFiltro)
        : eventos;

    elementos_tela.innerHTML = "";
    eventosFiltrados.forEach(evento => {
        elementos_tela.innerHTML += `<div>
            <small>${evento.data_hora}</small>
            <h2>${evento.titulo}</h2>
            <p>${evento.descricao}</p>
            <p>${evento.local}</p>
            <div class="actions-row">
                <button type="button" onclick="visitar_evento(${evento.id_evento})">Visualizar</button>
                <button type="button" onclick="alterar_evento(${evento.id_evento})">Alterar</button>
                <button type="button" onclick="excluir_evento(${evento.id_evento})">Excluir</button>
            </div>
        </div><hr>`;
    });
}

function novo_evento() {
    window.location.href = "evento_novo.html";
}

function visitar_evento(id_evento) {
    window.location.href = `visualizar_evento.html?id=${id_evento}`;
}

function alterar_evento(id_evento) {
    if (!id_evento) {
        alert("ID do evento não encontrado.");
        return;
    }
    window.location.href = `evento_alterar.html?id=${encodeURIComponent(id_evento)}`;
}

async function excluir_evento(id_evento) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) {
        return;
    }

    const resposta = await fetch(`../php/evento_excluir.php?id=${id_evento}`);
    const retorno = await resposta.json();
    if (retorno.status === "ok") {
        carregar_eventos();
    } else {
        alert(retorno.mensagem);
    }
}

function limpar_filtro() {
    document.getElementById("filtro_data").value = "";
    renderizar();
}