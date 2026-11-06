document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("../php/participante_get.php");
        const result = await response.json();

        if (!response.ok || result.status !== "sucesso") {
            window.location.href = "../login/login.html";
            return;
        }

        const participante = result.participante;
        const nome = document.getElementById("perfilNome");
        const email = document.getElementById("perfilEmail");
        const documento = document.getElementById("perfilDocumento");
        const telefone = document.getElementById("perfilTelefone");
        const avatarInicial = document.getElementById("avatarInicial");

        if (nome) nome.textContent = participante.nome;
        if (email) email.textContent = participante.email;
        if (documento) documento.textContent = participante.documento;
        if (telefone) telefone.textContent = participante.telefone;
        if (avatarInicial) {
            const inicial = (participante.nome || "P").trim().charAt(0).toUpperCase();
            avatarInicial.textContent = inicial;
        }
    } catch (error) {
        console.error("Erro ao carregar perfil do participante:", error);
        alert("Não foi possível carregar seu perfil. Tente novamente.");
    }
});
