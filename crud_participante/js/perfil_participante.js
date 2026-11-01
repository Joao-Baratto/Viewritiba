document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("../php/participante_get.php");
        const result = await response.json();

        if (!response.ok || result.status !== "sucesso") {
            window.location.href = "../login/login.html";
            return;
        }

        const participante = result.participante;
        document.getElementById("perfilNome").textContent = participante.nome;
        document.getElementById("perfilEmail").textContent = participante.email;
        document.getElementById("perfilDocumento").textContent = participante.documento;
        document.getElementById("perfilTelefone").textContent = participante.telefone;
        document.getElementById("avatarInicial").textContent = participante.nome.trim().charAt(0).toUpperCase();
    } catch (error) {
        console.error("Erro ao carregar perfil do participante:", error);
        alert("Não foi possível carregar seu perfil. Tente novamente.");
    }
});
