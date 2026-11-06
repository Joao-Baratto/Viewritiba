document.addEventListener("DOMContentLoaded", () => {
    buscar();
    configurarAbas();
});

document.getElementById("logoff").addEventListener("click", (evento) => {
    evento.preventDefault();
    logoff();
});

async function logoff() {
    const retorno = await fetch("../php/participante_logoff.php");
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        window.location.href = "../home/MainMenu.html?v=2";
    }
}

async function buscar() {
    const retorno = await fetch("../php/perfil_participante_get.php");
    const resposta = await retorno.json();
    if (resposta.status == "banido") {
        window.location.replace(resposta.redirect);
        return;
    }
    if (retorno.status == 401 || resposta.status != "ok") {
        window.location.href = "../login/login.html";
        return;
    }

    preencherPerfil(resposta.data.participante);
    preencherFavoritos(resposta.data.favoritos);
}

function preencherPerfil(participante) {
    document.getElementById("perfilNome").textContent = participante.nome;
    document.getElementById("avatarInicial").textContent = participante.nome.charAt(0).toUpperCase();

    mostrarContato("itemEmail", "perfilEmail", participante.email);
    mostrarContato("itemTelefone", "perfilTelefone", participante.telefone);
    mostrarContato("itemDocumento", "perfilDocumento", participante.documento);
}

function mostrarContato(id_item, id_texto, valor) {
    if (valor != "") {
        document.getElementById(id_texto).textContent = valor;
        document.getElementById(id_item).classList.remove("hidden");
    }
}

let compartilhadosCarregados = false;

function configurarAbas() {
    document.getElementById("abaFavoritos").addEventListener("click", () => {
        alternarAba("favoritos");
    });

    document.getElementById("abaCompartilhados").addEventListener("click", () => {
        alternarAba("compartilhados");
    });
}
function alternarAba(aba) {
    const favoritos = aba === "favoritos";

    document.getElementById("abaFavoritos")
        .classList.toggle("active", favoritos);

    document.getElementById("abaCompartilhados")
        .classList.toggle("active", !favoritos);

    document.getElementById("secaoFavoritos")
        .classList.toggle("hidden", !favoritos);

    document.getElementById("secaoCompartilhados")
        .classList.toggle("hidden", favoritos);

    if (!favoritos && !compartilhadosCarregados) {
        buscarCompartilhados();
    }
}

function preencherFavoritos(favoritos) {
    const grid = document.getElementById("gridEventos");
    const vazio = document.getElementById("emptyEventos");

    document.getElementById("statTotalFavoritos").textContent = favoritos.length;

    if (favoritos.length === 0) {
        grid.innerHTML = "";
        grid.classList.add("hidden");
        vazio.classList.remove("hidden");
        return;
    }

    grid.classList.remove("hidden");
    vazio.classList.add("hidden");

    let html = "";

    for (let i = 0; i < favoritos.length; i++) {
        html += `
            <a class="ig-event-card" href="../../crud_evento/home/visualizar_evento.html?id=${favoritos[i].id}">
                <div class="ig-event-cover">
                    <span class="ig-event-date-tag">${favoritos[i].data_hora.substring(0, 10)}</span>
                    <div class="ig-event-info">
                        <h4 class="ig-event-title">${favoritos[i].titulo}</h4>
                        <p class="ig-event-local">${favoritos[i].local}</p>
                    </div>
                </div>
            </a>
        `;
    }

    grid.innerHTML = html;
}


async function buscarCompartilhados() {
    const grid = document.getElementById("gridCompartilhados");
    const vazio = document.getElementById("emptyCompartilhados");

    grid.classList.add("hidden");
    vazio.classList.remove("hidden");
    vazio.querySelector("p").textContent = "Carregando compartilhamentos...";

    try {
        const retorno = await fetch(
            "../../compartilhamento_eventos/compartilhar_recebidos.php"
        );

        if (retorno.status === 401) {
            window.location.href = "../login/login.html";
            return;
        }

        const resposta = await retorno.json();

        if (!retorno.ok || resposta.status !== "ok") {
            throw new Error(resposta.mensagem || "Erro ao carregar.");
        }

        preencherCompartilhados(resposta.data);
        compartilhadosCarregados = true;

    } catch (erro) {
        console.error(erro);
        vazio.querySelector("p").textContent =
            "Não foi possível carregar os compartilhamentos.";
    }
}



function preencherCompartilhados(eventos) {
    const grid = document.getElementById("gridCompartilhados");
    const vazio = document.getElementById("emptyCompartilhados");

    // Limpa os cards anteriores
    grid.replaceChildren();

    // Verifica se existem eventos recebidos
    if (!Array.isArray(eventos) || eventos.length === 0) {
        grid.classList.add("hidden");
        vazio.classList.remove("hidden");

        vazio.querySelector("p").textContent =
            "Ninguém compartilhou eventos com você ainda.";

        return;
    }

    // Mostra os eventos compartilhados
    grid.classList.remove("hidden");
    vazio.classList.add("hidden");

    eventos.forEach(evento => {
        const card = document.createElement("a");
        card.className = "ig-event-card";

        card.href =
            "../../crud_evento/home/visualizar_evento.html?id=" +
            encodeURIComponent(evento.id_evento);

        const capa = document.createElement("div");
        capa.className = "ig-event-cover";

        const data = document.createElement("span");
        data.className = "ig-event-date-tag";
        data.textContent = (evento.data_hora || "").substring(0, 10);

        const info = document.createElement("div");
        info.className = "ig-event-info";

        const titulo = document.createElement("h4");
        titulo.className = "ig-event-title";
        titulo.textContent = evento.titulo || "Evento sem título";

        const local = document.createElement("p");
        local.className = "ig-event-local";
        local.textContent = evento.local || "Local não informado";

        const remetente = document.createElement("p");
        remetente.className = "compartilhado-remetente";
        remetente.textContent =
            "Compartilhado por: " + (evento.remetente || "Usuário");

        info.append(titulo, local, remetente);

        if (evento.mensagem) {
            const mensagem = document.createElement("p");
            mensagem.className = "compartilhado-mensagem";
            mensagem.textContent = evento.mensagem;

            info.appendChild(mensagem);
        }

        capa.append(data, info);
        card.appendChild(capa);
        grid.appendChild(card);
    });
}
