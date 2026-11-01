document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("../php/valida_sessao.php");
        const result = await response.json();

        if (!response.ok || result.status !== "ok") {
            window.location.href = "../login/login.html";
            return;
        }

        const nome = result.data.nome || "participante";
        document.getElementById("nomeParticipante").textContent = nome.split(" ")[0];
    } catch (error) {
        console.error("Erro ao validar sessão do participante:", error);
        alert("Não foi possível validar sua sessão. Faça login novamente.");
        window.location.href = "../login/login.html";
    }
});
