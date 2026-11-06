document.getElementById("form-categoria").addEventListener("submit", async (event) => {
    event.preventDefault();
    const campo = document.getElementById("nome-categoria");
    const nome = campo.value.trim();
    if (nome === "" || nome.length > 50) {
        mostrarMensagem("mensagem-categorias", "Informe o nome da categoria com até 50 caracteres.");
        return;
    }
    if (await enviarCategoria({ nome })) {
        campo.value = "";
    }
});

async function carregarCategorias() {
    try {
        const response = await fetch("php/categoria_listar.php");
        const result = await response.json();
        if (response.status === 401) {
            window.location.replace("../crud_organizador/login/Login.html");
            return;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível carregar as categorias.");
        }
        renderizarCategorias(result.data);
    } catch (error) {
        mostrarMensagem("mensagem-categorias", error.message);
    }
}

function renderizarCategorias(categorias) {
    const lista = document.getElementById("lista-categorias");
    lista.replaceChildren();
    if (categorias.length === 0) {
        lista.append(criarTexto("p", "Nenhuma categoria cadastrada."));
        return;
    }

    categorias.forEach((categoria) => {
        const details = criarDetalhes([categoria.nome_categoria]);
        const card = document.createElement("article");
        card.className = "moderation-card categoria-card";

        const form = criarFormularioCategoria(categoria);
        const editar = criarBotao("Editar", () => {
            form.hidden = false;
            form.querySelector("input").focus();
        }, "btn-secondary");
        const excluir = criarBotao("Excluir categoria", () => excluirCategoria(categoria));

        const acoes = document.createElement("div");
        acoes.className = "moderation-actions";
        acoes.append(editar, excluir);

        card.append(details, acoes, form);
        lista.append(card);
    });
}

function criarFormularioCategoria(categoria) {
    const form = document.createElement("form");
    form.className = "ban-reason-form";
    form.hidden = true;

    const label = document.createElement("label");
    label.textContent = "Novo nome da categoria";
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 50;
    input.required = true;
    input.value = categoria.nome_categoria;
    label.append(input);

    const actions = document.createElement("div");
    actions.className = "moderation-actions";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn-secondary";
    submit.textContent = "Salvar";
    const cancel = criarBotao("Cancelar", () => {
        form.reset();
        form.hidden = true;
    }, "btn-secondary");
    actions.append(submit, cancel);
    form.append(label, actions);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nome = input.value.trim();
        if (nome === "" || nome.length > 50) {
            mostrarMensagem("mensagem-categorias", "Informe o nome da categoria com até 50 caracteres.");
            return;
        }
        submit.disabled = true;
        await enviarCategoria({ id: categoria.id_categoria, nome });
        submit.disabled = false;
    });
    return form;
}

async function enviarCategoria({ id = null, nome }) {
    const dados = new FormData();
    if (id !== null) dados.set("id", id);
    dados.set("nome", nome);
    return await enviarAcaoCategoria("categoria_salvar.php", dados);
}

async function excluirCategoria(categoria) {
    if (!window.confirm(`Excluir a categoria "${categoria.nome_categoria}"?`)) {
        return;
    }
    const dados = new FormData();
    dados.set("id", categoria.id_categoria);
    await enviarAcaoCategoria("categoria_excluir.php", dados);
}

async function enviarAcaoCategoria(endpoint, dados) {
    try {
        const response = await fetch(`php/${endpoint}`, {
            method: "POST",
            headers: { "X-CSRF-Token": csrfToken },
            body: dados
        });
        const result = await response.json();
        if (response.status === 401) {
            window.location.replace("../crud_organizador/login/Login.html");
            return false;
        }
        if (!response.ok || result.status !== "ok") {
            throw new Error(result.mensagem || "Não foi possível concluir a ação.");
        }
        await carregarCategorias();
        mostrarMensagem("mensagem-categorias", result.mensagem);
        return true;
    } catch (error) {
        mostrarMensagem("mensagem-categorias", error.message);
        return false;
    }
}
