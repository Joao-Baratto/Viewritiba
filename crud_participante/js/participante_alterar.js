document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("formParticipante");
    const senhaAtual = document.getElementById("senha_atual");
    const novaSenha = document.getElementById("nova_senha");
    const confirmarSenha = document.getElementById("confirmar_senha");

    try {
        const response = await fetch("../php/participante_get.php");
        const result = await response.json();

        if (!response.ok || result.status !== "sucesso") {
            window.location.href = "../login/login.html";
            return;
        }

        document.getElementById("nome").value = result.participante.nome;
        document.getElementById("email").value = result.participante.email;
        document.getElementById("telefone").value = result.participante.telefone;
        document.getElementById("documento").value = result.participante.documento;
    } catch (error) {
        console.error("Erro ao carregar dados do participante:", error);
        alert("Não foi possível carregar seus dados. Tente novamente.");
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (novaSenha.value || confirmarSenha.value) {
            if (novaSenha.value.length < 6) {
                alert("A nova senha deve ter pelo menos 6 caracteres.");
                return;
            }
            if (novaSenha.value !== confirmarSenha.value) {
                alert("A nova senha e a confirmação não coincidem.");
                return;
            }
            if (!senhaAtual.value) {
                alert("Informe sua senha atual para alterá-la.");
                senhaAtual.focus();
                return;
            }
        }

        try {
            const response = await fetch("../php/participante_alterar.php", {
                method: "POST",
                body: new FormData(form)
            });
            const result = await response.json();

            if (!response.ok || result.status !== "sucesso") {
                alert("Erro: " + result.mensagem);
                return;
            }

            alert(result.mensagem);
            window.location.href = "perfil_participante.html";
        } catch (error) {
            console.error("Erro ao atualizar participante:", error);
            alert("Não foi possível salvar suas alterações. Tente novamente.");
        }
    });

    document.getElementById("btnExcluir").addEventListener("click", async function () {
        if (!window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) {
            return;
        }

        try {
            const response = await fetch("../php/participante_excluir.php", { method: "POST" });
            const result = await response.json();

            if (!response.ok || result.status !== "sucesso") {
                alert("Erro: " + result.mensagem);
                return;
            }

            alert(result.mensagem);
            window.location.href = "../login/login.html";
        } catch (error) {
            console.error("Erro ao excluir participante:", error);
            alert("Não foi possível excluir sua conta. Tente novamente.");
        }
    });
});
