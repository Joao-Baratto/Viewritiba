document.addEventListener('DOMContentLoaded', function () {
    const lista = document.getElementById('lista-compartilhados');
    const contador = document.getElementById('contador');
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
 
    // Mostra uma mensagem no lugar da lista (vazio ou erro)
    function mostrarMensagem(texto, ehErro) {
        lista.replaceChildren(criar('p', ehErro ? 'lista-erro' : 'lista-vazia', texto));
    }
 
    // Monta o card de UM evento recebido
    function montarCard(item) {
        // troca o espaço por "T" para o navegador entender a data do MySQL
        const data = new Date(item.data_hora.replace(' ', 'T'));
 
        const card = criar('div', 'card-recebido');
 
        const blocoData = criar('div', 'bloco-data');
        blocoData.append(
            criar('span', 'dia', String(data.getDate()).padStart(2, '0')),
            criar('span', 'mes', meses[data.getMonth()] + ' ' + data.getFullYear())
        );
 
        const info = criar('div', 'info-evento');
        info.append(
            criar('h3', '', item.titulo),
            criar('p', 'local-evento', item.local),
            criar('p', 'remetente', 'Enviado por ' + item.remetente)
        );
 
        // Só mostra a mensagem se a pessoa escreveu alguma
        if (item.mensagem) {
            info.appendChild(criar('p', 'mensagem-recebida', item.mensagem));
        }
 
        const ver = criar('a', 'btn-ver-evento', 'Ver evento');
        ver.href = montarLink(item); // função que vem do compartilhar.js
        info.appendChild(ver);
 
        card.append(blocoData, info);
        return card;
    }
 
    async function carregar() {
        try {
            const resp = await fetch('compartilhar_recebidos.php');
            const resultado = await resp.json();
 
            // 401 = não logado, 500 = erro de banco: mostra a mensagem que o servidor mandou
            if (!resp.ok || resultado.status !== 'ok') {
                contador.textContent = 'Não foi possível carregar';
                mostrarMensagem(resultado.mensagem || 'Erro ao carregar os eventos.', true);
                return;
            }
 
            const qtd = resultado.data.length;
 
            if (qtd === 0) {
                contador.textContent = 'Nenhum evento recebido';
                mostrarMensagem('Ninguém enviou eventos para você ainda.', false);
                return;
            }
 
            contador.textContent = qtd === 1 ? '1 evento recebido' : qtd + ' eventos recebidos';
            lista.replaceChildren(...resultado.data.map(montarCard));
 
        } catch (erro) {
            console.error('Erro ao buscar compartilhados', erro);
            contador.textContent = 'Não foi possível carregar';
            mostrarMensagem('Não foi possível carregar agora. Tente novamente.', true);
        }
    }
 
    carregar();
});
 