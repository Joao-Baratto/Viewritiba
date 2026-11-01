document.addEventListener('DOMContentLoaded', async () => {
    // Referências aos elementos do formulário de alteração
    const formPerfil = document.getElementById('formPerfil');
    const nomeInput = document.getElementById('nome');
    const bioInput = document.getElementById('bio');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const documentoInput = document.getElementById('documento');
    const novaSenhaInput = document.getElementById('nova_senha');
    const confirmaNovaSenhaInput = document.getElementById('confirma_nova_senha');

    const displayName = document.getElementById('displayName');
    const displayBio = document.getElementById('displayBio');

    /**
     * Carrega as informações atuais do organizador logado
     */
    async function carregarDados() {
        try {
            const res = await fetch('../php/perfil_organizador_get.php');
            const data = await res.json();

            if (data.status === 'sucesso') {
                const info = data.organizador || data.data;
                if (nomeInput) nomeInput.value = info.nome || '';
                if (bioInput) bioInput.value = info.bio || '';
                if (emailInput) emailInput.value = info.email || '';
                if (telefoneInput) telefoneInput.value = info.telefone || '';
                if (documentoInput) documentoInput.value = info.documento || '';

                const avatarLetter = document.getElementById('avatarLetter');
                if (avatarLetter) {
                    avatarLetter.textContent = (info.nome || 'O').trim().charAt(0).toUpperCase();
                }

                if (displayName) displayName.textContent = info.nome || 'Organizador';
                if (displayBio) displayBio.textContent = info.bio || 'Gerencie seus eventos e personalize suas informações no Viewritiba.';
            } else {
                alert('Acesso restrito. Faça login para acessar esta página.');
                window.location.href = '../login/Login.html';
            }
        } catch (error) {
            console.error('Erro ao carregar dados do organizador:', error);
            alert('Não foi possível carregar os dados. Verifique sua conexão.');
        }
    }

    await carregarDados();

    const senhaAtualInput = document.getElementById('senha_atual');
    const btnValidarSenhaAtual = document.getElementById('btnValidarSenhaAtual');
    const msgValidacaoSenha = document.getElementById('msgValidacaoSenha');

    let senhaAtualConfirmada = false;

    // Validação da senha atual para liberar os campos de nova senha
    if (btnValidarSenhaAtual && senhaAtualInput) {
        btnValidarSenhaAtual.addEventListener('click', async () => {
            const senhaAtual = senhaAtualInput.value;

            if (!senhaAtual) {
                if (msgValidacaoSenha) {
                    msgValidacaoSenha.textContent = 'Por favor, digite sua senha atual.';
                    msgValidacaoSenha.className = 'helper-text-status error';
                }
                senhaAtualInput.focus();
                return;
            }

            btnValidarSenhaAtual.disabled = true;
            btnValidarSenhaAtual.textContent = 'Verificando...';

            const fd = new FormData();
            fd.append('senha_atual', senhaAtual);

            try {
                const res = await fetch('../php/perfil_organizador_validar_senha.php', {
                    method: 'POST',
                    body: fd
                });
                const resp = await res.json();

                if (resp.status === 'sucesso') {
                    senhaAtualConfirmada = true;
                    if (msgValidacaoSenha) {
                        msgValidacaoSenha.textContent = '✓ Senha atual confirmada! Agora você pode definir sua nova senha.';
                        msgValidacaoSenha.className = 'helper-text-status success';
                    }

                    // Libera os campos de nova senha
                    if (novaSenhaInput) {
                        novaSenhaInput.disabled = false;
                        novaSenhaInput.classList.remove('input-locked');
                        novaSenhaInput.focus();
                    }
                    if (confirmaNovaSenhaInput) {
                        confirmaNovaSenhaInput.disabled = false;
                        confirmaNovaSenhaInput.classList.remove('input-locked');
                    }

                    senhaAtualInput.readOnly = true;
                    btnValidarSenhaAtual.textContent = 'Confirmada';
                } else {
                    senhaAtualConfirmada = false;
                    if (msgValidacaoSenha) {
                        msgValidacaoSenha.textContent = '✕ ' + resp.mensagem;
                        msgValidacaoSenha.className = 'helper-text-status error';
                    }
                    btnValidarSenhaAtual.disabled = false;
                    btnValidarSenhaAtual.textContent = 'Confirmar Senha';
                }
            } catch (err) {
                console.error('Erro na validação da senha atual:', err);
                if (msgValidacaoSenha) {
                    msgValidacaoSenha.textContent = 'Erro ao verificar senha. Tente novamente.';
                    msgValidacaoSenha.className = 'helper-text-status error';
                }
                btnValidarSenhaAtual.disabled = false;
                btnValidarSenhaAtual.textContent = 'Confirmar Senha';
            }
        });
    }

    // Submissão do formulário de atualização
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            const telefone = telefoneInput.value.trim();
            const bio = bioInput.value.trim();
            const novaSenha = novaSenhaInput ? novaSenhaInput.value : '';
            const confirmaNovaSenha = confirmaNovaSenhaInput ? confirmaNovaSenhaInput.value : '';

            if (!nome || !email || !telefone) {
                alert('Preencha os campos obrigatórios: Nome, E-mail e Telefone.');
                return;
            }

            // Validação de senha se foi informada
            if (novaSenha || confirmaNovaSenha) {
                if (!senhaAtualConfirmada) {
                    alert('Por favor, confirme sua senha atual antes de salvar uma nova senha.');
                    if (senhaAtualInput) senhaAtualInput.focus();
                    return;
                }
                if (novaSenha.length < 6) {
                    alert('A nova senha deve possuir no mínimo 6 caracteres.');
                    return;
                }
                if (novaSenha !== confirmaNovaSenha) {
                    alert('A nova senha e a confirmação não coincidem.');
                    return;
                }
            }

            const fd = new FormData();
            fd.append('nome', nome);
            fd.append('bio', bio);
            fd.append('email', email);
            fd.append('telefone', telefone);
            if (novaSenha && senhaAtualConfirmada) {
                fd.append('senha_atual', senhaAtualInput.value);
                fd.append('nova_senha', novaSenha);
            }

            try {
                const res = await fetch('../php/perfil_organizador_update.php', {
                    method: 'POST',
                    body: fd
                });
                const result = await res.json();

                if (result.status === 'sucesso') {
                    showToast(result.mensagem);
                    if (displayName) displayName.textContent = nome || 'Organizador';
                    if (displayBio) displayBio.textContent = bio || 'Gerencie seus eventos e personalize suas informações no Viewritiba.';
                    if (novaSenhaInput) novaSenhaInput.value = '';
                    if (confirmaNovaSenhaInput) confirmaNovaSenhaInput.value = '';

                    // Redireciona de volta para o perfil após 1.5s
                    setTimeout(() => {
                        window.location.href = 'perfil_organizador.html';
                    }, 1500);
                } else {
                    alert('Erro: ' + result.mensagem);
                }
            } catch (error) {
                console.error('Erro ao atualizar perfil:', error);
                alert('Erro ao processar a atualização. Tente novamente.');
            }
        });
    }

    // Modal e Exclusão de Conta
    const modalConfirmarExclusao = document.getElementById('modalConfirmarExclusao');
    const btnAbrirModalExcluir = document.getElementById('btnAbrirModalExcluir');
    const btnFecharModalExcluir = document.getElementById('btnFecharModalExcluir');
    const btnCancelarExclusao = document.getElementById('btnCancelarExclusao');
    const btnConfirmarExclusaoFinal = document.getElementById('btnConfirmarExclusaoFinal');
    const backdropExcluir = document.getElementById('backdropExcluir');

    if (btnAbrirModalExcluir && modalConfirmarExclusao) {
        btnAbrirModalExcluir.addEventListener('click', () => modalConfirmarExclusao.classList.remove('hidden'));
        if (btnFecharModalExcluir) btnFecharModalExcluir.addEventListener('click', () => modalConfirmarExclusao.classList.add('hidden'));
        if (btnCancelarExclusao) btnCancelarExclusao.addEventListener('click', () => modalConfirmarExclusao.classList.add('hidden'));
        if (backdropExcluir) backdropExcluir.addEventListener('click', () => modalConfirmarExclusao.classList.add('hidden'));

        if (btnConfirmarExclusaoFinal) {
            btnConfirmarExclusaoFinal.addEventListener('click', async () => {
                try {
                    const res = await fetch('../php/perfil_organizador_excluir.php', {
                        method: 'POST'
                    });
                    const result = await res.json();

                    if (result.status === 'sucesso') {
                        modalConfirmarExclusao.classList.add('hidden');
                        alert('Conta excluída com sucesso. Você será redirecionado para a tela de login.');
                        window.location.href = '../login/Login.html';
                    } else {
                        alert('Erro ao excluir conta: ' + result.mensagem);
                    }
                } catch (error) {
                    console.error('Erro na exclusão:', error);
                    alert('Não foi possível processar a exclusão da conta.');
                }
            });
        }
    }

    // Toast de notificação
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    let toastTimeout;

    function showToast(msg) {
        if (!toastNotification || !toastMessage) return;
        toastMessage.textContent = msg;
        toastNotification.classList.remove('hidden');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastNotification.classList.add('hidden');
        }, 3500);
    }
});
