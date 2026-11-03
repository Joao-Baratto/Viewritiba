let lista_categorias = [];
let categorias_adicionadas = [];
async function carregar_categorias(selecionadas = []) {
    const adicionar_categorias = document.getElementById("categorias");
    const resposta = await fetch("../php/categoria_get.php");
    const retorno = await resposta.json();
    lista_categorias = retorno.data;
    categorias_adicionadas = selecionadas;
    adicionar_categorias.innerHTML = `
        <div id="categorias_tags" class="categorias-tags"></div>
        <div class="categorias-autocomplete">
            <input type="text" id="categoria_busca" placeholder="Digite uma categoria..."
                oninput="mostrar_sugestoes()" onfocus="mostrar_sugestoes()" onblur="document.getElementById('categorias_sugestoes').hidden = true">
            <ul id="categorias_sugestoes" class="categorias-sugestoes" hidden></ul>
        </div>
    `;
    renderizar_tags();
}
function mostrar_sugestoes() {
    const sugestoes = document.getElementById("categorias_sugestoes");
    const pesquisa = document.getElementById("categoria_busca").value.trim().toLowerCase();
    const encontradas = lista_categorias.filter(categoria =>
        !categorias_adicionadas.includes(categoria.id_categoria) &&
        categoria.nome_categoria.toLowerCase().includes(pesquisa)
    );
    sugestoes.innerHTML = "";
    if (encontradas.length == 0) {
        sugestoes.innerHTML = `<li class="sem-resultado">Nenhuma categoria encontrada</li>`;
    }
    encontradas.forEach(categoria => {
        sugestoes.innerHTML += `
            <li data-id="${categoria.id_categoria}" onmousedown="event.preventDefault(); escolher_categoria(${categoria.id_categoria})">
                ${categoria.nome_categoria}
            </li>
        `;
    });
    sugestoes.hidden = false;
}
function escolher_categoria(id_categoria) {
    if (!categorias_adicionadas.includes(id_categoria)) {
        categorias_adicionadas.push(id_categoria);
    }
    const busca = document.getElementById("categoria_busca");
    busca.value = "";
    renderizar_tags();
    mostrar_sugestoes();
    busca.focus();
}
function remover_categoria(id_categoria) {
    categorias_adicionadas = categorias_adicionadas.filter(id => id != id_categoria);
    renderizar_tags();
    if (!document.getElementById("categorias_sugestoes").hidden) {
        mostrar_sugestoes();
    }
}
function renderizar_tags() {
    const tags = document.getElementById("categorias_tags");
    tags.innerHTML = "";
    categorias_adicionadas.forEach(id_categoria => {
        const categoria = lista_categorias.find(item => item.id_categoria == id_categoria);
        if (categoria) {
            tags.innerHTML += `
                <span class="categoria-tag">
                    ${categoria.nome_categoria}
                    <button type="button" title="Remover" onclick="remover_categoria(${categoria.id_categoria})">&times;</button>
                </span>
            `;
        }
    });
}
