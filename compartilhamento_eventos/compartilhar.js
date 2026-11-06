// ===== CONFIGURAÇÃO (ajuste aqui se mudar o nome ou a pasta do projeto) =====
const BASES = ['/viewritiba/Viewritiba', '/viewritiba'];

let BASE_PROJETO = location.origin + BASES[BASES.length - 1];
const pagina = location.pathname.toLowerCase();

for (const base of BASES) {
    if (pagina.startsWith(base.toLowerCase() + '/')) {
        BASE_PROJETO = location.origin + base;
        break;
    }
}

const URL_DETALHE = BASE_PROJETO + '/crud_evento/home/visualizar_evento.html';

const URL_API_ENVIAR = BASE_PROJETO + '/compartilhamento_eventos/compartilhar_enviar.php';
 
// Link que leva à tela do evento
function montarLink(evento) {
    return `${URL_DETALHE}?id=${evento.id_evento}`;
}
 
// Cria um elemento já com classe e texto (textContent evita injeção de HTML)
function criar(tag, classe, texto) {
    const el = document.createElement(tag);

    if (classe) {
        el.className = classe;
    }

    if (texto !== undefined && texto !== null) {
        el.textContent = String(texto);
    }

    return el;
}
 
function fecharMenuCompartilhar() {
    const aberto = document.querySelector('.share-overlay');
    if (aberto) aberto.remove();
}
 
// Função principal: chame com o objeto do evento (precisa de id_evento, titulo e local)
function compartilharEvento(evento) {
    fecharMenuCompartilhar();
 
    const link = montarLink(evento);
    const texto = `Olha esse evento: ${evento.titulo} (${evento.local})`;
 
    const overlay = criar('div', 'share-overlay');
    overlay.addEventListener('click', e => {
        if (e.target === overlay) fecharMenuCompartilhar();
    });
 
    const box = criar('div', 'share-box');
    box.appendChild(criar('h3', '', 'Compartilhar: ' + evento.titulo));
 
    // ---------- Parte 1: compartilhar fora da plataforma ----------
    const redes = [
        { nome: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(texto + ' ' + link)}` },
        { nome: 'Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(texto)}` },
        { nome: 'E-mail',   url: `mailto:?subject=${encodeURIComponent(evento.titulo)}&body=${encodeURIComponent(texto + ' ' + link)}` }
    ];
 
    redes.forEach(rede => {
        const a = criar('a', 'share-opcao', rede.nome);
        a.href = rede.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        box.appendChild(a);
    });
 
    const btnCopiar = criar('button', 'share-opcao', 'Copiar link');
    btnCopiar.type = 'button';
    btnCopiar.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(link);
            btnCopiar.textContent = 'Link copiado!';
        } catch (e) {
            btnCopiar.textContent = 'Não foi possível copiar';
        }
    });
    box.appendChild(btnCopiar);
 
    // Menu nativo do celular (só aparece em navegadores que suportam)
    if (navigator.share) {
        const btnApps = criar('button', 'share-opcao', 'Outros aplicativos');
        btnApps.type = 'button';
        btnApps.addEventListener('click', async () => {
            try {
                await navigator.share({ title: evento.titulo, text: texto, url: link });
            } catch (e) { /* a pessoa cancelou, tudo bem */ }
        });
        box.appendChild(btnApps);
    }
 
    // ---------- Parte 2: enviar para um usuário do Viewritiba ----------
    box.appendChild(criar('h4', 'share-subtitulo', 'Enviar para alguém do Viewritiba'));
 
    const campoEmail = criar('input', 'share-campo');
    campoEmail.type = 'email';
    campoEmail.placeholder = 'E-mail da pessoa';
    campoEmail.setAttribute('aria-label', 'E-mail da pessoa');
 
    const campoMsg = criar('input', 'share-campo');
    campoMsg.type = 'text';
    campoMsg.maxLength = 200;
    campoMsg.placeholder = 'Mensagem (opcional)';
    campoMsg.setAttribute('aria-label', 'Mensagem opcional');
 
    const btnEnviar = criar('button', 'share-enviar', 'Enviar evento');
    btnEnviar.type = 'button';
 
    const status = criar('p', 'share-status');
    status.setAttribute('role', 'status');
 
    btnEnviar.addEventListener('click', () => {
        enviarParaUsuario(evento, campoEmail.value.trim(), campoMsg.value.trim(), status, btnEnviar);
    });
 
    box.append(campoEmail, campoMsg, btnEnviar, status);
 
    const btnFechar = criar('button', 'share-fechar', 'Fechar');
    btnFechar.type = 'button';
    btnFechar.addEventListener('click', fecharMenuCompartilhar);
    box.appendChild(btnFechar);
 
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}
 
// Manda o evento para outro usuário (POST + fetch, igual ao padrão dos favoritos)
async function enviarParaUsuario(evento, email, mensagem, status, botao) {
    status.className = 'share-status';
 
    if (!email) {
        status.classList.add('erro');
        status.textContent = 'Digite o e-mail da pessoa.';
        return;
    }
 
    status.textContent = 'Enviando...';
    botao.disabled = true;
 
    try {
        const resp = await fetch(URL_API_ENVIAR, {
            method: 'POST',
            body: new URLSearchParams({
                evento_id: evento.id_evento,
                email_destino: email,
                mensagem: mensagem
            })
        });
        const dados = await resp.json();
 
        // fetch NÃO dá erro sozinho em 400/404/500: é preciso olhar resp.ok
        if (!resp.ok || dados.status !== 'ok') {
            status.classList.add('erro');
            status.textContent = dados.mensagem || 'Não foi possível enviar.';
            return;
        }
 
        status.classList.add('ok');
        status.textContent = dados.mensagem;
    } catch (e) {
        status.classList.add('erro');
        status.textContent = 'Não foi possível enviar agora. Tente novamente.';
    } finally {
        botao.disabled = false;
    }
}