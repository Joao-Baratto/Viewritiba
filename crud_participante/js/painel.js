document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../php/valida_sessao.php");
        const session = await response.json();

        if (session.status !== "ok") {
            window.location.replace("../login/login.html");
        }
    } catch (error) {
        console.error("Não foi possível validar o acesso ao painel do participante:", error);
        alert("Não foi possível validar sua sessão. Tente novamente.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const sair = document.getElementById("logoff");
    if (!sair) return;
    sair.addEventListener("click", async (evento) => {
        evento.preventDefault();
        try {
            await fetch("../php/participante_logoff.php");
        } finally {
            window.location.href = "../home/MainMenu.html?v=2";
        }
    });
});
