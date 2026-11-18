/*
 * Combobox multi-select de categorias (estilo Material UI, cores do projeto).
 * Uso: const combo = new ComboCategorias(elementoContainer, lista, {
 *          selecionadas: [1, 2], placeholder: "Digite uma categoria...", onChange: (ids) => {}
 *      });
 *      combo.valores() -> [ids]    combo.limpar()
 */
class ComboCategorias {
    constructor(container, lista, opcoes = {}) {
        this.lista = lista;
        this.selecionadas = (opcoes.selecionadas || []).map(Number);
        this.onChange = opcoes.onChange || function () {};
        this.limitar = opcoes.limitar || 0; // máx. de chips visíveis quando fora de foco (0 = todos)
        this.unica = !!opcoes.unica;        // true = seleção única (nome dentro do campo, sem chips)
        this.digitou = false;               // seleção única: o usuário está digitando para filtrar
        this.destaque = -1;

        container.innerHTML = `
            <div class="categorias-autocomplete">
                <div class="categorias-input">
                    <div class="categorias-tags"></div>
                    <input type="text" placeholder="${opcoes.placeholder || "Digite uma categoria..."}"
                        autocomplete="off" role="combobox" aria-expanded="false">
                    <div class="categorias-acoes">
                        <button type="button" class="categorias-limpar" title="Limpar" hidden>
                            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
                        </button>
                        <button type="button" class="categorias-seta" tabindex="-1" title="Abrir">
                            <svg viewBox="0 0 24 24" width="24" height="24"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>
                        </button>
                    </div>
                </div>
                <ul class="categorias-sugestoes" role="listbox" aria-multiselectable="true" hidden></ul>
            </div>
        `;

        this.caixa = container.querySelector(".categorias-input");
        if (this.unica) this.caixa.classList.add("unica");
        this.tags = container.querySelector(".categorias-tags");
        this.busca = container.querySelector("input");
        this.sugestoes = container.querySelector(".categorias-sugestoes");
        this.botaoLimpar = container.querySelector(".categorias-limpar");

        this.caixa.addEventListener("click", () => this.busca.focus());
        this.busca.addEventListener("input", () => { this.digitou = true; this.destaque = -1; this.mostrar(); });
        this.busca.addEventListener("focus", () => {
            if (this.unica) this.busca.select();
            this.mostrar();
            this.renderizarTags();
        });
        this.busca.addEventListener("blur", () => { this.fechar(); this.renderizarTags(); });
        this.busca.addEventListener("keydown", (e) => this.teclado(e));
        this.botaoLimpar.addEventListener("mousedown", (e) => { e.preventDefault(); this.limpar(); });
        container.querySelector(".categorias-seta").addEventListener("mousedown", (e) => {
            e.preventDefault();
            this.sugestoes.hidden ? (this.busca.focus(), this.mostrar()) : this.fechar();
        });
        this.sugestoes.addEventListener("mousedown", (e) => {
            e.preventDefault();
            const item = e.target.closest("li[data-id]");
            if (item) this.alternar(Number(item.dataset.id));
        });
        this.tags.addEventListener("mousedown", (e) => {
            const botao = e.target.closest("button[data-id]");
            if (botao) { e.preventDefault(); this.remover(Number(botao.dataset.id)); }
        });

        this.renderizarTags();
    }

    valores() {
        return this.selecionadas.slice();
    }

    mostrar() {
        const pesquisa = this.unica && !this.digitou ? "" : this.busca.value.trim().toLowerCase();
        const encontradas = this.lista.filter(c => c.nome_categoria.toLowerCase().includes(pesquisa));
        this.sugestoes.innerHTML = encontradas.length == 0
            ? `<li class="sem-resultado">Nenhuma categoria encontrada</li>`
            : encontradas.map((c, i) => {
                const marcada = this.selecionadas.includes(Number(c.id_categoria));
                return `<li data-id="${c.id_categoria}" role="option" aria-selected="${marcada}"
                    class="${marcada ? "marcada" : ""} ${i == this.destaque ? "destaque" : ""}">${c.nome_categoria}</li>`;
            }).join("");
        this.sugestoes.hidden = false;
        this.busca.setAttribute("aria-expanded", "true");
        this.caixa.classList.add("aberto");
    }

    fechar() {
        this.sugestoes.hidden = true;
        this.digitou = false;
        this.busca.value = this.unica ? this.nomeSelecionado() : "";
        this.destaque = -1;
        this.busca.setAttribute("aria-expanded", "false");
        this.caixa.classList.remove("aberto");
    }

    nomeSelecionado() {
        const c = this.lista.find(item => item.id_categoria == this.selecionadas[0]);
        return c ? c.nome_categoria : "";
    }

    alternar(id) {
        if (this.unica) {
            this.selecionadas = [id];
            this.fechar();
            this.renderizarTags();
            this.busca.blur();
            this.onChange(this.valores());
            return;
        }
        this.selecionadas = this.selecionadas.includes(id)
            ? this.selecionadas.filter(x => x != id)
            : this.selecionadas.concat(id);
        this.atualizar();
        this.busca.focus();
    }

    remover(id) {
        this.selecionadas = this.selecionadas.filter(x => x != id);
        this.atualizar();
    }

    limpar() {
        this.selecionadas = [];
        this.digitou = false;
        if (this.unica) this.busca.value = "";
        this.atualizar();
    }

    atualizar() {
        this.renderizarTags();
        if (!this.sugestoes.hidden) this.mostrar();
        this.onChange(this.valores());
    }

    teclado(e) {
        const itens = this.sugestoes.querySelectorAll("li[data-id]");
        if (e.key == "ArrowDown" || e.key == "ArrowUp") {
            e.preventDefault();
            if (this.sugestoes.hidden) { this.mostrar(); return; }
            if (itens.length == 0) return;
            this.destaque = (this.destaque + (e.key == "ArrowDown" ? 1 : -1) + itens.length) % itens.length;
            this.mostrar();
            const atual = this.sugestoes.querySelector("li.destaque");
            if (atual) atual.scrollIntoView({ block: "nearest" });
        } else if (e.key == "Enter") {
            if (!this.sugestoes.hidden && itens[this.destaque]) {
                e.preventDefault();
                e.stopPropagation();
                this.alternar(Number(itens[this.destaque].dataset.id));
            }
        } else if (e.key == "Escape") {
            this.fechar();
        } else if (!this.unica && e.key == "Backspace" && this.busca.value == "" && this.selecionadas.length > 0) {
            this.remover(this.selecionadas[this.selecionadas.length - 1]);
        }
    }

    renderizarTags() {
        if (this.unica) {
            this.tags.innerHTML = "";
            if (!this.digitou) this.busca.value = this.nomeSelecionado();
            this.botaoLimpar.hidden = this.selecionadas.length == 0;
            this.caixa.classList.toggle("com-valor", this.selecionadas.length > 0);
            return;
        }
        const emFoco = this.caixa.classList.contains("aberto");
        const recolher = this.limitar > 0 && !emFoco && this.selecionadas.length > this.limitar;
        const visiveis = recolher ? this.selecionadas.slice(0, this.limitar) : this.selecionadas;
        let html = visiveis.map(id => {
            const c = this.lista.find(item => item.id_categoria == id);
            return c ? `
                <span class="categoria-tag"><span class="categoria-nome">${c.nome_categoria}</span>
                    <button type="button" title="Remover" data-id="${c.id_categoria}">
                        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/></svg>
                    </button>
                </span>` : "";
        }).join("");
        if (recolher) {
            html += `<span class="categoria-tag categoria-mais">+${this.selecionadas.length - this.limitar}</span>`;
        }
        this.tags.innerHTML = html;
        this.botaoLimpar.hidden = this.selecionadas.length == 0;
        this.caixa.classList.toggle("com-valor", this.selecionadas.length > 0);
    }
}
