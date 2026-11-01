let csrfToken = "";

document.addEventListener("DOMContentLoaded", iniciarPainel);
document.getElementById("atualizar").addEventListener("click", carregarListas);
document.getElementById("btn-sair").addEventListener("click", sair);

async function iniciarPainel() {
    try {
        const response = await fetch("php/validar_sessao.php");
        const result = await response.json();
        if (response.status === 401) {
            window.location.replace("../crud_organizador/login/Login.html");
            return;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível validar a sessão.");
        }
        csrfToken = result.csrf_token;
        document.getElementById("nome-moderador").textContent = result.nome;
        await carregarListas();
    } catch (error) {
        mostrarMensagem("mensagem-eventos", error.message);
    }
}

async function carregarListas() {
    try {
        const response = await fetch("php/moderacao_listar.php");
        const result = await response.json();
        if (response.status === 401) {
            window.location.replace("../crud_organizador/login/Login.html");
            return;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível carregar os itens.");
        }
        renderizarEventos(result.eventos);
        renderizarComentarios(result.comentarios);
        renderizarContas(result.contas);
        mostrarMensagem("mensagem-eventos", "");
        mostrarMensagem("mensagem-comentarios", "");
        mostrarMensagem("mensagem-contas", "");
    } catch (error) {
        mostrarMensagem("mensagem-eventos", error.message);
    }
}

function renderizarEventos(eventos) {
    const lista = document.getElementById("lista-eventos");
    lista.replaceChildren();
    if (eventos.length === 0) {
        lista.append(criarTexto("p", "Nenhum evento cadastrado."));
        return;
    }

    eventos.forEach((evento) => {
        const details = criarDetalhes([
            evento.titulo,
            `Organizador: ${evento.organizador}`,
            `${evento.data_hora} · ${evento.local}`
        ]);
        const button = criarBotao("Excluir evento", () => excluirEvento(evento.id));
        lista.append(criarCard(details, button));
    });
}

function renderizarComentarios(comentarios) {
    const lista = document.getElementById("lista-comentarios");
    lista.replaceChildren();
    if (comentarios.length === 0) {
        lista.append(criarTexto("p", "Nenhum comentário cadastrado."));
        return;
    }

    comentarios.forEach((comentario) => {
        const details = criarDetalhes([
            comentario.evento,
            `${comentario.usuario} · ${comentario.data}`,
            comentario.comentario
        ]);
        const button = criarBotao("Excluir comentário", () => excluirComentario(comentario.id));
        lista.append(criarCard(details, button));
    });
}

function renderizarContas(contas) {
    const lista = document.getElementById("lista-contas");
    lista.replaceChildren();
    if (contas.length === 0) {
        lista.append(criarTexto("p", "Nenhuma conta cadastrada."));
        return;
    }

    contas.forEach((conta) => {
        const suspensa = conta.motivo !== null;
        const tipo = conta.tipo_conta === "organizador" ? "Organizador" : "Participante";
        const details = criarDetalhes([
            `${conta.nome} · ${tipo}`,
            conta.email,
            suspensa ? `Suspensa em ${conta.banido_em}. Motivo: ${conta.motivo}` : "Conta ativa"
        ]);
        const card = document.createElement("article");
        card.className = "moderation-card";
        card.append(details);

        if (suspensa) {
            card.append(criarBotao("Remover suspensão", () => desbanirConta(conta), "btn-secondary"));
        } else {
            const form = criarFormularioSuspensao(conta);
            const button = criarBotao("Suspender conta", () => {
                form.hidden = false;
                form.querySelector("textarea").focus();
            }, "btn-warning");
            card.append(button, form);
        }

        lista.append(card);
    });
}

function criarFormularioSuspensao(conta) {
    const form = document.createElement("form");
    form.className = "ban-reason-form";
    form.hidden = true;

    const label = document.createElement("label");
    label.textContent = `Motivo da suspensão de ${conta.nome}`;

    const textarea = document.createElement("textarea");
    textarea.name = "motivo";
    textarea.maxLength = 2000;
    textarea.required = true;
    textarea.rows = 4;
    textarea.setAttribute("aria-label", label.textContent);
    label.append(textarea);

    const actions = document.createElement("div");
    actions.className = "moderation-actions";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn-warning";
    submit.textContent = "Confirmar suspensão";
    const cancel = criarBotao("Cancelar", () => {
        form.reset();
        form.hidden = true;
    }, "btn-secondary");
    actions.append(submit, cancel);

    form.append(label, actions);
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const motivo = textarea.value.trim();
        if (motivo === "" || motivo.length > 2000) {
            mostrarMensagem("mensagem-contas", "Informe um motivo de até 2000 caracteres.");
            return;
        }

        submit.disabled = true;
        await enviarAcaoConta("conta_banir.php", conta, motivo);
        submit.disabled = false;
    });

    return form;
}

function criarDetalhes(linhas) {
    const details = document.createElement("div");
    details.append(criarTexto("h3", linhas[0]));
    linhas.slice(1).forEach((linha) => details.append(criarTexto("p", linha)));
    return details;
}

function criarCard(details, button) {
    const card = document.createElement("article");
    card.className = "moderation-card";
    card.append(details, button);
    return card;
}

function criarTexto(tag, texto) {
    const element = document.createElement(tag);
    element.textContent = texto;
    return element;
}

function criarBotao(texto, acao, className = "btn-danger") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = texto;
    button.addEventListener("click", acao);
    return button;
}

async function desbanirConta(conta) {
    if (!window.confirm(`Remover a suspensão da conta de ${conta.nome}?`)) {
        return;
    }
    await enviarAcaoConta("conta_desbanir.php", conta);
}

async function enviarAcaoConta(endpoint, conta, motivo = "") {
    const dados = new FormData();
    dados.set("tipo_conta", conta.tipo_conta);
    dados.set("id_conta", conta.id);
    if (motivo !== "") {
        dados.set("motivo", motivo);
    }

    try {
        const response = await fetch(`php/${endpoint}`, {
            method: "POST",
            headers: { "X-CSRF-Token": csrfToken },
            body: dados
        });
        const result = await response.json();
        if (response.status === 401) {
            window.location.replace("../crud_organizador/login/Login.html");
            return;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível atualizar a suspensão.");
        }
        await carregarListas();
        mostrarMensagem("mensagem-contas", result.mensagem);
    } catch (error) {
        mostrarMensagem("mensagem-contas", error.message);
    }
}

async function excluirEvento(id) {
    if (!window.confirm("Excluir este evento e todos os comentários associados?")) {
        return;
    }
    await excluirItem("evento_excluir.php", id, "mensagem-eventos");
}

async function excluirComentario(id) {
    if (!window.confirm("Excluir este comentário?")) {
        return;
    }
    await excluirItem("comentario_excluir.php", id, "mensagem-comentarios");
}

async function excluirItem(endpoint, id, messageElementId) {
    const dados = new FormData();
    dados.set("id", id);
    try {
        const response = await fetch(`php/${endpoint}`, {
            method: "POST",
            headers: { "X-CSRF-Token": csrfToken },
            body: dados
        });
        const result = await response.json();
        if (response.status === 401) {
            window.location.replace("../crud_organizador/login/Login.html");
            return;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível excluir o item.");
        }
        await carregarListas();
        mostrarMensagem(messageElementId, result.mensagem);
    } catch (error) {
        mostrarMensagem(messageElementId, error.message);
    }
}

async function sair() {
    try {
        const response = await fetch("php/logoff.php", {
            method: "POST",
            headers: { "X-CSRF-Token": csrfToken }
        });
        const result = await response.json();
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível encerrar a sessão.");
        }
        window.location.replace("../crud_organizador/login/Login.html");
    } catch (error) {
        mostrarMensagem("mensagem-eventos", error.message);
    }
}

function mostrarMensagem(elementId, mensagem) {
    document.getElementById(elementId).textContent = mensagem;
}
