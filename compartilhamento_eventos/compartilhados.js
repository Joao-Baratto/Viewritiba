document.addEventListener('DOMContentLoaded', function () {
    const lista = document.getElementById('lista-compartilhados');
    const contador = document.getElementById('contador');
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const idsFavoritados = new Set();

async function carregarFavoritos() {
    const resposta = await fetch('../favoritos/favoritos_get.php');

    if (!resposta.ok) {
        throw new Error('Erro ao consultar favoritos');
    }

    const resultado = await resposta.json();

    if (resultado.status === 'ok') {
        resultado.data.forEach(evento => {
            idsFavoritados.add(Number(evento.id_evento));
        });
    } else if (resultado.mensagem !== 'Nenhum favorito encontrado') {
        throw new Error(resultado.mensagem || 'Erro ao consultar favoritos');
    }
}
function atualizarBotaoFavorito(botao, favoritado) {
    botao.textContent = favoritado ? '♥ Favoritado' : '♡ Favoritar';
    botao.classList.toggle('favoritado', favoritado);
    botao.setAttribute('aria-pressed', String(favoritado));
}
    function getStatusEvento(dataEvento) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataDoEvento = new Date(dataEvento.replace(' ', 'T'));
    dataDoEvento.setHours(0, 0, 0, 0);

    if (dataDoEvento < hoje) {
        return { texto: "Encerrado", cor: "#9ca3af" };
    } else if (dataDoEvento.getTime() === hoje.getTime()) {
        return { texto: "Hoje", cor: "#d97706" };
    } else {
        return { texto: "Confirmado", cor: "#16a34a" };
    }
}
 
    // Mostra uma mensagem no lugar da lista (vazio ou erro)
    function mostrarMensagem(texto, ehErro) {
        lista.replaceChildren(criar('p', ehErro ? 'lista-erro' : 'lista-vazia', texto));
    }
 
    // Monta o card de UM evento recebido
    function montarCard(item) {
        // troca o espaço por "T" para o navegador entender a data do MySQL
        const data = new Date(item.data_hora.replace(' ', 'T'));
        const status = getStatusEvento(item.data_hora);
 
        const card = criar('div', 'card-recebido');
 
        const blocoData = criar('div', 'bloco-data');
        blocoData.append(
            criar('span', 'dia', String(data.getDate()).padStart(2, '0')),
            criar('span', 'mes', meses[data.getMonth()] + ' ' + data.getFullYear())
        );
 
        const info = criar('div', 'info-evento');

info.append(
    criar('h3', '', item.titulo),
    criar('p', 'local-evento', '📍 ' + item.local),
    criar('p', 'remetente', '👤 Enviado por ' + item.remetente)
);
const badge = criar('span', 'status-badge', status.texto);
badge.style.backgroundColor = status.cor;
info.appendChild(badge);
 
        // Só mostra a mensagem se a pessoa escreveu alguma
        if (item.mensagem) {
            info.appendChild(criar('p', 'mensagem-recebida', item.mensagem));
        }
 
        const acoes = criar('div', 'acoes-evento');

const ver = criar('a', 'btn-ver-evento', 'Ver evento');
ver.href = montarLink(item);

const favoritar = criar('button', 'btn-favoritar');
favoritar.type = 'button';

const idEvento = Number(item.id_evento);

atualizarBotaoFavorito(
    favoritar,
    idsFavoritados.has(idEvento)
);

favoritar.addEventListener('click', async () => {
    if (favoritar.disabled) return;

    const jaFavoritado = idsFavoritados.has(idEvento);

    const endpoint = jaFavoritado
        ? '../favoritos/favoritos_remover.php'
        : '../favoritos/favoritos_add.php';

    favoritar.disabled = true;
    favoritar.textContent = jaFavoritado ? 'Removendo...' : 'Salvando...';

    try {
        const resposta = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                evento_id: String(idEvento)
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok || resultado.status !== 'ok') {
            throw new Error(resultado.mensagem || 'Erro ao atualizar favorito');
        }

        if (jaFavoritado) {
            idsFavoritados.delete(idEvento);
        } else {
            idsFavoritados.add(idEvento);
        }

    } catch (erro) {
        console.error('Erro ao atualizar favorito:', erro);
        alert(erro.message || 'Não foi possível atualizar o favorito.');
    } finally {
        atualizarBotaoFavorito(
            favoritar,
            idsFavoritados.has(idEvento)
        );

        favoritar.disabled = false;
    }
});
acoes.append(ver, favoritar);
info.appendChild(acoes);
 
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
 
    async function iniciarPagina() {
    try {
        await carregarFavoritos();
    } catch (erro) {
        console.error('Não foi possível consultar os favoritos:', erro);
    }

    await carregar();
}

iniciarPagina();
});
 