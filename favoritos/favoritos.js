document.addEventListener("DOMContentLoaded", function() {
    const urlAPI = 'favoritos_get.php';

    function getStatusEvento(dataEvento) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dataDoEvento = new Date(dataEvento);
        dataDoEvento.setHours(0, 0, 0, 0);

        if (dataDoEvento < hoje) {
            return { texto: "Encerrado", cor: "#9ca3af" };
        } else if (dataDoEvento.getTime() === hoje.getTime()) {
            return { texto: "Hoje", cor: "#d97706" };
        } else {
            return { texto: "Confirmado", cor: "#16a34a" };
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

    fetch(urlAPI)
        .then(response => response.json())
        .then(resultado => {
            const container = document.getElementById('lista-favoritos-container');
            const contador = document.getElementById('contador-favoritos');
            container.innerHTML = '';

            if (resultado.status === 'ok' && resultado.data.length > 0) {
                const qtd = resultado.data.length;
                if (contador) {
                    contador.textContent = qtd === 1 ? '1 evento encontrado' : `${qtd} eventos encontrados`;
                }

                resultado.data.forEach(evento => {

                    const dataObj = new Date(evento.data_hora);
                    const dia = dataObj.getDate().toString().padStart(2, '0');
                    const meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
                    const mes = meses[dataObj.getMonth()];
                    const ano = dataObj.getFullYear();
                    const status = getStatusEvento(evento.data_hora);

                    const cardHTML = `
                        <div class="card-favorito" data-id="${evento.id_evento}">
                            <div class="bloco-data">
                                <span class="dia">${dia}</span>
                                <span class="mes">${mes}<br>${ano}</span>
                            </div>
                            <div class="info-evento">
                                <h3>${evento.titulo}</h3>
                                <p class="local-evento">${evento.local}</p>

                                <span class="status-badge" style="background:${status.cor};">
                                    ${status.texto}
                                </span>

                                <div class="linha-obs">
                                    <input type="text" class="input-obs" data-id="${evento.id_evento}" value="${evento.observacao || ''}" placeholder="Adicionar observação...">
                                    <button class="btn-salvar-obs" data-id="${evento.id_evento}">Salvar</button>
                                </div>

                                <div class="linha-remover">
                                    <button class="btn-remover" data-id="${evento.id_evento}">Remover</button>
                                </div>
                            </div>
                        </div>
                    `;

                    container.innerHTML += cardHTML;
                });

                ativarBotoesRemover();
                ativarBotoesSalvarObs();
            } else {
                if (contador) contador.textContent = '0 eventos encontrados';
                container.innerHTML = '<p class="lista-vazia">Nenhum evento encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os eventos', error);
        });

    function ativarBotoesRemover() {
        const botoes = document.querySelectorAll('.btn-remover');
        botoes.forEach(botao => {
            botao.addEventListener('click', function () {
                const confirmou = confirm("Tem certeza que quer remover este evento dos favoritos?");
                 if (!confirmou) {
                return;
            }
                const id_evento = this.getAttribute('data-id');
                const card = this.closest('.card-favorito');

                fetch('favoritos_remover.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `evento_id=${id_evento}`
                })
                .then(res => res.json())
                .then(resultado => {
                    if (resultado.status === 'ok') {
                        card.remove();
                        mostrarConfirmacao("Evento removido dos favoritos");

                        const contador = document.getElementById('contador-favoritos');
                        const restantes = document.querySelectorAll('.card-favorito').length;
                        if (contador) {
                            contador.textContent = restantes === 1 ? '1 evento encontrado' : `${restantes} eventos encontrados`;
                        }
                    } else {
                        mostrarConfirmacao("Erro ao remover evento", true);
                    }
                })
                .catch(err => console.error('Erro ao remover:', err));
            });
        });
    }

    function ativarBotoesSalvarObs() {
        const botoes = document.querySelectorAll('.btn-salvar-obs');
        botoes.forEach(botao => {
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
    }
});