document.addEventListener('DOMContentLoaded', async () => {
    // Referências aos elementos do DOM
    const perfilNome = document.getElementById('perfilNome');
    const avatarInicial = document.getElementById('avatarInicial');
    const avatarImg = document.getElementById('avatarImg');
    const donoActions = document.getElementById('donoActions');
    const statTotalEventos = document.getElementById('statTotalEventos');

    const bioContainer = document.getElementById('bioContainer');
    const perfilBio = document.getElementById('perfilBio');

    const itemEmail = document.getElementById('itemEmail');
    const perfilEmail = document.getElementById('perfilEmail');

    const itemTelefone = document.getElementById('itemTelefone');
    const perfilTelefone = document.getElementById('perfilTelefone');

    const itemDocumento = document.getElementById('itemDocumento');
    const perfilDocumento = document.getElementById('perfilDocumento');

    const gridEventos = document.getElementById('gridEventos');
    const emptyEventos = document.getElementById('emptyEventos');
    const linkLogin = document.getElementById('linkLogin');

    /**
     * Formata data para exibição no card de evento
     */
    function formatarDataCurta(dataStr) {
        if (!dataStr) return '';
        try {
            const d = new Date(dataStr.replace(' ', 'T'));
            if (isNaN(d.getTime())) return dataStr;
            const dia = String(d.getDate()).padStart(2, '0');
            const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
            return `${dia} ${mes}`;
        } catch (e) {
            return '';
        }
    }

    /**
     * Carrega as informações reais do organizador a partir do banco de dados
     */
    async function carregarPerfil() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const idParam = urlParams.get('id');
            const url = idParam 
                ? `../php/perfil_organizador_get.php?id=${encodeURIComponent(idParam)}`
                : '../php/perfil_organizador_get.php';

            const res = await fetch(url);
            const resposta = await res.json();

            if (resposta.status !== 'sucesso') {
                // Redireciona para o login caso não esteja autenticado
                window.location.href = '../login/Login.html';
                return;
            }

            const org = resposta.organizador || resposta.data;
            const eventos = resposta.eventos || [];
            const isDono = Boolean(resposta.is_dono);

            // Nome e Inicial do Avatar
            const nomeOrganizador = org.nome || 'Organizador';
            if (perfilNome) perfilNome.textContent = nomeOrganizador;
            if (avatarInicial) {
                avatarInicial.textContent = nomeOrganizador.trim().charAt(0).toUpperCase();
            }

            // Exibição de ações do dono (Editar Perfil / Criar Evento)
            if (isDono) {
                if (donoActions) donoActions.classList.remove('hidden');
                if (linkLogin) linkLogin.classList.add('hidden'); // Já está logado
            } else {
                if (donoActions) donoActions.classList.add('hidden');
            }

            // Total de Eventos Criados
            if (statTotalEventos) {
                statTotalEventos.textContent = eventos.length;
            }

            // Biografia (Exibe apenas se preenchida no banco)
            if (org.bio && org.bio.trim() !== '') {
                if (perfilBio) perfilBio.textContent = org.bio.trim();
                if (bioContainer) bioContainer.classList.remove('hidden');
            } else {
                if (bioContainer) bioContainer.classList.add('hidden');
            }

            // E-mail
            if (org.email && org.email.trim() !== '') {
                if (perfilEmail) perfilEmail.textContent = org.email.trim();
                if (itemEmail) itemEmail.classList.remove('hidden');
            }

            // Telefone
            if (org.telefone && org.telefone.trim() !== '') {
                if (perfilTelefone) perfilTelefone.textContent = org.telefone.trim();
                if (itemTelefone) itemTelefone.classList.remove('hidden');
            }

            // Documento
            if (org.documento && org.documento.trim() !== '') {
                if (perfilDocumento) perfilDocumento.textContent = org.documento.trim();
                if (itemDocumento) itemDocumento.classList.remove('hidden');
            }

            // Renderizar Grade de Eventos
            renderizarEventos(eventos, resposta.eventos_erro);

        } catch (erro) {
            console.error('Erro ao buscar perfil do organizador:', erro);
            window.location.href = '../login/Login.html';
        }
    }

    /**
     * Renderiza os cards de eventos criados pelo organizador
     */
    function renderizarEventos(eventos, houveErro = false) {
        if (!gridEventos) return;

        gridEventos.innerHTML = '';

        if (!eventos || eventos.length === 0) {
            gridEventos.classList.add('hidden');
            if (emptyEventos) {
                emptyEventos.textContent = houveErro
                    ? 'Não foi possível carregar os eventos.'
                    : 'Nenhum evento criado ainda.';
                emptyEventos.classList.remove('hidden');
            }
            return;
        }

        gridEventos.classList.remove('hidden');
        if (emptyEventos) emptyEventos.classList.add('hidden');

        eventos.forEach(evt => {
            const card = document.createElement('a');
            card.className = 'ig-event-card';
            card.href = `../../crud_evento/home/visualizar_evento.html?id=${evt.id}`;
            card.title = evt.titulo || 'Evento';

            const dataFormatada = formatarDataCurta(evt.data_hora);
            const local = evt.local || 'Curitiba';

            card.innerHTML = `
                <div class="ig-event-cover">
                    ${dataFormatada ? `<span class="ig-event-date-tag">${dataFormatada}</span>` : ''}
                    <div class="ig-event-info">
                        <h4 class="ig-event-title">${evt.titulo || 'Evento'}</h4>
                        <p class="ig-event-local">${local}</p>
                    </div>
                </div>
            `;

            gridEventos.appendChild(card);
        });
    }

    await carregarPerfil();
});
