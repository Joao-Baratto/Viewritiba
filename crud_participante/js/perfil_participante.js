document.addEventListener("DOMContentLoaded", () => {
    buscar();
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

function preencherFavoritos(favoritos) {
    document.getElementById("statTotalFavoritos").textContent = favoritos.length;

    if (favoritos.length == 0) {
        document.getElementById("gridEventos").classList.add("hidden");
        document.getElementById("emptyEventos").classList.remove("hidden");
        return;
    }

    var html = "";

    for (var i = 0; i < favoritos.length; i++) {
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

    document.getElementById("gridEventos").innerHTML = html;
}
