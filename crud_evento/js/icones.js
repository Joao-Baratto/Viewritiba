/*
 * Ícones das ações (conjunto Feather, o mesmo de react-icons/fi), como SVG embutido.
 * "favoritar" e "desfavoritar" são do Lucide (react-icons/lu: LuBookmarkPlus / LuBookmarkMinus).
 * Uso: icone("share") -> string com o <svg>;  icone("excluir", 18, true) -> versão preenchida.
 * Os botões que usam ícone ganham title/aria-label com o nome da ação.
 */
const ICONES_FEATHER = {
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    comentarios: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    favoritar: '<path d="M12 7v6m3-3H9m8-7a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>',
    desfavoritar: '<path d="M15 10H9m8-7a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>',
    editar: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    excluir: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    visitar: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    local: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    voltar: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    ver: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    salvar: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'
};

function icone(nome, tamanho = 18, preenchido = false) {
    return `<svg viewBox="0 0 24 24" width="${tamanho}" height="${tamanho}" fill="${preenchido ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES_FEATHER[nome] || ""}</svg>`;
}

// Marcador ao lado do título nas listas: avisa que o evento tem link, antes de abrir os detalhes
function marcadorLink(evento) {
    if (!evento || !evento.link) {
        return "";
    }
    return `<span class="marcador-link" title="Este evento tem link" aria-label="Este evento tem link" role="img"
        style="display:inline-flex;vertical-align:-3px;margin-right:6px;color:#c64d32;">${icone("link", 16)}</span>`;
}

// Botões de ação das listas todos no mesmo tom: ícone coral sobre fundo pêssego suave.
// O <style> entra no fim do <head>, então vence as cores por botão definidas nos CSS (mesma especificidade).
(function () {
    const estilo = document.createElement("style");
    estilo.textContent = `
        #lista a.btn-icone, #lista-explorar a.btn-icone {
            background: rgba(233, 95, 71, 0.10);
            color: #e95f47;
        }
        #lista a.btn-icone:hover, #lista-explorar a.btn-icone:hover {
            background: rgba(233, 95, 71, 0.18);
            color: #e95f47;
        }
        .btn-icone svg { color: #e95f47; }
    `;
    document.head.appendChild(estilo);
})();

// Preenche os <span data-icone="nome"> do HTML estático (ex.: botões dos detalhes do evento)
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-icone]").forEach((el) => {
        el.innerHTML = icone(el.dataset.icone, Number(el.dataset.tamanho) || 20);
    });
});
