let comentarios = [];
let elementos_tela;
const parametros = new URLSearchParams(window.location.search);
const id_evento = parametros.get("id");
document.addEventListener("DOMContentLoaded", () => {
    elementos_tela = document.getElementById("elementos_tela");
    const btn_voltar = document.getElementById("btn_voltar");
    const btn_topo = document.getElementById("btn_topo");
    const btn_comentario = document.getElementById("btn_comentario");
    if (!id_evento) {
        alert("Evento inválido.");
        window.location.href = "../../crud_evento/home/index.html";
        return;
    }
    if (btn_voltar) {
        btn_voltar.addEventListener("click", (e) => {
            e.preventDefault();
            voltar();
        });
    }
    if (btn_topo) {
        btn_topo.addEventListener("click", () => {
            window.location.href = "#";
        });
    }
    if (btn_comentario) {
        btn_comentario.addEventListener("click", (e) =>{
            e.preventDefault();
            enviar();
        });
    }
    carregar_comentarios();
});
async function enviar() {
    const campoComentario = document.getElementById("new_comentario");
    const conteudo = campoComentario.value.trim();
    const nota = document.getElementById("new_nota").value;

    if (!conteudo) {
        alert("Por favor, escreva um comentário.");
        return;
    }
    const fd = new FormData();
    fd.append("texto", conteudo);
    fd.append("id_evento", id_evento);
    fd.append("nota", nota);

    try {
        const resposta = await fetch("../../crud_comentarios/php/comentario_new.php", {
            method: "POST",
            body: fd
        });
        const retorno = await resposta.json();
        if (retorno.status == "ok") {
            campoComentario.value = "";
            document.getElementById("new_nota").value = "";
            carregar_comentarios();
        } else {
            const mensagem = retorno.mensagem_retorno || retorno.mensagem || "Erro desconhecido do servidor.";
            alert("Erro ao inserir comentário: " + mensagem);
        }
    } catch (erro) {
        alert("Não foi possível enviar o comentário.");
    }
}
async function carregar_comentarios() {
    try {
        const resposta = await fetch(`../../crud_comentarios/php/comentario_get.php?id_evento=${id_evento}`);
        const retorno = await resposta.json();
        comentarios = retorno.status == "ok" ? (retorno.data || []) : [];
        renderizar_comentarios();
    } catch (erro) {
        elementos_tela.innerHTML = "<p>Não foi possível carregar os comentários.</p>";
    }
}

function renderizar_comentarios() {
    elementos_tela.innerHTML = "";
    comentarios.forEach(comentario => {
        elementos_tela.innerHTML += `
            <div class="comentario-card">
                <div class="comentario-meta">
                    <span class="comentario-user">${comentario.nome_usuario}</span>
                    <span class="comentario-data">${comentario.data_criacao}</span>
                </div>
                <p class="comentario-texto">${comentario.texto}</p>
                <span >★Nota: ${comentario.nota}/5</span>
                <div class="comentario-acoes">
                    <button type="button" class="btn-alterar" onclick="alterar_comentario(${comentario.id})">Alterar</button>
                    <button type="button" class="btn-delete" onclick="excluir_comentario(${comentario.id})">Excluir</button>
                </div>
            </div>
        `;
    });
}
function alterar_comentario(id_comentario) {
    window.location.href = `alterar_comentario.html?id=${id_comentario}&id_evento=${id_evento}`;
}
async function excluir_comentario(id_comentario) {
    if (!confirm("Deseja excluir este comentário?")) {
        return;
    }
    try {
        const resposta = await fetch(`../../crud_comentarios/php/comentario_excluir.php?id_comentario=${id_comentario}`, {
            method: "DELETE"
        });
        const retorno = await resposta.json();

        if (retorno.status == "ok") {
            carregar_comentarios();
        } else {
            alert("Erro ao excluir comentário: " + retorno.mensagem_retorno);
        }
    } catch (erro) {
        alert("Não foi possível excluir o comentário.");
    }
}
function voltar() {
    window.location.href = `../../crud_evento/home/index.html`;
    alert("Voltando para a página de eventos...");
}
async function deslogar() {
    const retorno = await fetch("../php/deslogar.php");
    const resposta = await retorno.json();

    console.log(resposta);

    if (resposta.status == "ok") {
        window.location.replace("../login/index.html");
    }
};