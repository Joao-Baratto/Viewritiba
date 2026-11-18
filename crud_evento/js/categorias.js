// Campo "Categorias" dos formulários de evento (novo / alterar).
// Mantém as globais usadas por evento_novo.js e evento_alterar.js.
let lista_categorias = [];
let categorias_adicionadas = [];

async function carregar_categorias(selecionadas = []) {
    const resposta = await fetch("../php/categoria_get.php");
    const retorno = await resposta.json();
    lista_categorias = retorno.data;
    categorias_adicionadas = selecionadas.map(Number);
    new ComboCategorias(document.getElementById("categorias"), lista_categorias, {
        selecionadas: categorias_adicionadas,
        placeholder: "Digite uma categoria...",
        onChange: (ids) => { categorias_adicionadas = ids; }
    });
}
