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

function mostrarConfirmacao(mensagem) {
        const aviso = document.createElement('div');
        aviso.textContent = mensagem;
        aviso.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #16a34a;
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: bold;
            z-index: 1000;
            transition: opacity 0.3s;
        `;
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
            container.innerHTML = '';

            if (resultado.status === 'ok' && resultado.data.length > 0) {
                resultado.data.forEach(evento => {

                    const dataObj = new Date(evento.data_hora);
                    const dia = dataObj.getDate().toString().padStart(2, '0');
                    const meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
                    const mes = meses[dataObj.getMonth()];
                    const ano = dataObj.getFullYear();
                    const status = getStatusEvento(evento.data_hora)

                    const cardHTML = `
                        <div class="card-favorito" style="display: flex; background: #fff; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                            <div class="bloco-data" style="background: #111e2f; color: #fff; padding: 20px; text-align: center; min-width: 90px; display: flex; flex-direction: column; justify-content: center;">
                                <span class="dia" style="font-size: 28px; font-weight: bold; line-height: 1;">${dia}</span>
                                <span class="mes" style="font-size: 14px; margin-top: 5px; color: #8da4c4;">${mes}<br>${ano}</span>
                            </div>
                            <div class="info-evento" style="padding: 20px; display: flex; flex-direction: column; justify-content: center; flex-grow: 1;">
                                <h3 style="margin: 0 0 5px 0; font-size: 20px; color: #111;">${evento.titulo}</h3>
                                <p class="local-evento" style="margin: 0 0 15px 0; color: #666; font-size: 14px;">${evento.local}</p>
                                <div>
                                    <button class="btn-remover" data-id="${evento.id || evento.id_evento}" style="background: transparent; border: 1px solid #d9822b; color: #d9822b; padding: 6px 15px; border-radius: 20px; cursor: pointer; font-weight: bold;">Remover</button>
                                </div>
                            </div>
                        </div>
                    `;

                    container.innerHTML += cardHTML;
                });

                ativarBotoesRemover();
            } else {
                container.innerHTML = '<p style="padding: 20px; color: #665;">Nenhum evento encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os eventos', error);
        });

    function ativarBotoesRemover() {
        const botoes = document.querySelectorAll('.btn-remover');
        botoes.forEach(botao => {
            botao.addEventListener('click', function () {
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
                    } else {
                        mostrarConfirmacao("Erro ao remover evento");
                    }
                })
                .catch(err => console.error('Erro ao remover:', err));
            });
        });
    }});
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
                    mostrarConfirmacao(resultado.status === 'ok' ? "Observação salva" : "Erro ao salvar observação");
                })
                .catch(err => console.error('Erro ao salvar observação:', err));
            });
        });
    }

