document.addEventListener("DOMContentLoaded", function() {
    const urlAPI = 'favoritos_get.php';
    const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const QTD_FUROS = 9;

    // Mesmo valor de --tempo-destacar no ingresso.css
    const TEMPO_DESTACAR = 450;

    function esc(texto) {
        const div = document.createElement('div');
        div.textContent = texto ?? '';
        return div.innerHTML;
    }

    function getStatusEvento(dataEvento) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dataDoEvento = new Date(dataEvento);
        dataDoEvento.setHours(0, 0, 0, 0);

        if (dataDoEvento < hoje) {
            return { texto: "Encerrado", classe: "encerrado" };
        } else if (dataDoEvento.getTime() === hoje.getTime()) {
            return { texto: "Hoje", classe: "hoje" };
        } else {
            return { texto: "Em breve", classe: "proximo" };
        }
    }

    function mostrarConfirmacao(mensagem, isErro = false) {
        const aviso = document.createElement('div');
        aviso.textContent = mensagem;
        aviso.className = isErro ? 'aviso-confirmacao erro' : 'aviso-confirmacao';
        document.body.appendChild(aviso);

        setTimeout(() => {
            aviso.style.opacity = '0';
            setTimeout(() => aviso.remove(), 300);
        }, 2000);
    }

    function atualizarContador() {
        const contador = document.getElementById('contador-favoritos');
        const qtd = document.querySelectorAll('.ingresso:not(.saindo)').length;
        if (contador) {
            contador.textContent = qtd === 1 ? '1 evento encontrado' : `${qtd} eventos encontrados`;
        }
        if (qtd === 0) {
            document.getElementById('lista-favoritos-container').innerHTML =
                '<p class="lista-vazia">Nenhum evento encontrado.</p>';
        }
    }

    function montarIngresso(evento) {
        const dataObj = new Date(evento.data_hora);
        const dia = dataObj.getDate().toString().padStart(2, '0');
        const mes = MESES[dataObj.getMonth()];
        const ano = dataObj.getFullYear();
        const hora = dataObj.getHours().toString().padStart(2, '0') + ':' +
                     dataObj.getMinutes().toString().padStart(2, '0');
        const status = getStatusEvento(evento.data_hora);
        const id = Number(evento.id);

        let furos = '';
        for (let i = 0; i < QTD_FUROS; i++) {
            furos += `<span class="ingresso-furo" style="--i:${i};--n:${QTD_FUROS}"></span>`;
        }

        const encerrado = status.classe === 'encerrado';

        // Encerrado: canhoto já destacado (sem ações); a data aparece no corpo
        const canhoto = encerrado ? '' : `
                <div class="ingresso-canhoto">
                    <span class="ingresso-dia">${dia}</span>
                    <span class="ingresso-mes">${mes} ${ano}</span>
                    <span class="ingresso-hora">${hora}</span>

                    <div class="ingresso-acoes">
                        <a class="ingresso-botao" href="../crud_evento/home/visualizar_evento.html?id=${id}"
                            title="Detalhes" aria-label="Detalhes">${icone("info")}</a>
                        <button class="ingresso-botao ingresso-destacar" data-id="${id}"
                            title="Remover dos favoritos"
                            aria-label="Remover dos favoritos">${icone("excluir")}</button>
                    </div>
                </div>`;

        // Encerrado: único botão (Detalhes), à direita.
        // Sem observação: na linha da data. Com observação: embaixo, na linha da observação.
        const botaoDetalhes = `
                        <a class="ingresso-botao" href="../crud_evento/home/visualizar_evento.html?id=${id}"
                            title="Detalhes" aria-label="Detalhes">${icone("info")}</a>`;
        const temObs = Boolean(evento.observacao && String(evento.observacao).trim());

        const dataNoCorpo = !encerrado ? '' : `
                    <div class="ingresso-data-encerrado">
                        ${icone("calendario", 16)}<span>${dia} ${mes} ${ano} · ${hora}</span>${temObs ? '' : botaoDetalhes}
                    </div>`;

        // Encerrado: só leitura. Mostra a observação já salva (se houver), sem campo para editar
        const observacao = encerrado
            ? (temObs
                ? `
                    <div class="ingresso-obs-linha">
                        <p class="ingresso-obs-texto">${esc(evento.observacao)}</p>${botaoDetalhes}
                    </div>`
                : '')
            : `
                    <div class="ingresso-obs">
                        <input type="text" class="input-obs" data-id="${id}" value="${esc(evento.observacao)}"
                            placeholder="Adicionar observação..." aria-label="Observação do evento">
                        <button class="ingresso-botao btn-salvar-obs" data-id="${id}"
                            title="Salvar observação" aria-label="Salvar observação">${icone("salvar")}</button>
                    </div>`;

        return `
            <article class="ingresso ${encerrado ? 'encerrado' : ''}" data-id="${id}">
                <div class="ingresso-corpo">
                    <div class="ingresso-topo">
                        <span class="ingresso-rotulo">Viewritiba · Ingresso salvo</span>
                        <span class="ingresso-status ${status.classe}">${status.texto}</span>
                    </div>
                    <h3>${marcadorLink(evento)}${esc(evento.titulo)}</h3>
                    <p class="ingresso-local">${icone("local", 16)}<span>${esc(evento.local)}</span></p>${dataNoCorpo}
${observacao}
                </div>

                <div class="ingresso-picote" aria-hidden="true">${furos}</div>
${canhoto}
            </article>
        `;
    }

    fetch(urlAPI)
        .then(response => response.json())
        .then(resultado => {
            const container = document.getElementById('lista-favoritos-container');
            container.innerHTML = '';

            if (resultado.status === 'ok' && resultado.data.length > 0) {
                // Ordem: primeiro os próximos (inclui hoje), do mais perto ao mais longe;
                // depois os encerrados, do mais recente ao mais antigo
                const eventos = resultado.data.slice().sort((a, b) => {
                    const aEncerrado = getStatusEvento(a.data_hora).classe === 'encerrado';
                    const bEncerrado = getStatusEvento(b.data_hora).classe === 'encerrado';
                    if (aEncerrado !== bEncerrado) {
                        return aEncerrado ? 1 : -1;
                    }
                    const diferenca = new Date(a.data_hora) - new Date(b.data_hora);
                    return aEncerrado ? -diferenca : diferenca;
                });
                container.innerHTML = eventos.map(montarIngresso).join('');
                atualizarContador();
                ativarBotoesDestacar();
                ativarBotoesSalvarObs();
            } else {
                atualizarContador();
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os eventos', error);
        });

    // Remover = destacar o canhoto com um clique.
    // Os furos do picote enchem rapidamente (TEMPO_DESTACAR ms) e o canhoto se solta.
    function ativarBotoesDestacar() {
        document.querySelectorAll('.ingresso-destacar').forEach(botao => {
            const ingresso = botao.closest('.ingresso');

            botao.addEventListener('click', () => {
                if (ingresso.classList.contains('destacando') || ingresso.classList.contains('destacado')) return;
                ingresso.classList.add('destacando');
                setTimeout(() => remover(ingresso, botao.dataset.id), TEMPO_DESTACAR);
            });
        });
    }

    function remover(ingresso, id_evento) {
        ingresso.classList.remove('destacando');
        ingresso.classList.add('destacado');

        fetch('favoritos_remover.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `evento_id=${encodeURIComponent(id_evento)}`
        })
        .then(res => res.json())
        .then(resultado => {
            if (resultado.status === 'ok') {
                // Depois do canhoto cair, o ingresso some da lista
                setTimeout(() => {
                    ingresso.classList.add('saindo');
                    setTimeout(() => {
                        ingresso.remove();
                        atualizarContador();
                    }, 400);
                }, 350);
                mostrarConfirmacao("Evento removido dos favoritos");
            } else {
                ingresso.classList.remove('destacado');
                mostrarConfirmacao("Erro ao remover evento", true);
            }
        })
        .catch(err => {
            console.error('Erro ao remover:', err);
            ingresso.classList.remove('destacado');
            mostrarConfirmacao("Erro ao remover evento", true);
        });
    }

    function ativarBotoesSalvarObs() {
        document.querySelectorAll('.btn-salvar-obs').forEach(botao => {
            botao.addEventListener('click', function () {
                const id_evento = this.getAttribute('data-id');
                const input = document.querySelector(`.input-obs[data-id="${id_evento}"]`);
                const observacao = input.value;

                fetch('favoritos_update.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `evento_id=${id_evento}&observacao=${encodeURIComponent(observacao)}`
                })
                .then(res => res.json())
                .then(resultado => {
                    const sucesso = resultado.status === 'ok';
                    mostrarConfirmacao(sucesso ? "Observação salva" : "Erro ao salvar observação", !sucesso);
                })
                .catch(err => console.error('Erro ao salvar observação:', err));
            });
        });

        // Enter no campo também salva
        document.querySelectorAll('.input-obs').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    document.querySelector(`.btn-salvar-obs[data-id="${input.dataset.id}"]`).click();
                }
            });
        });
    }
});
