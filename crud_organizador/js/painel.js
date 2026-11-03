document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../../crud_evento/php/valida_sessao.php");
        const session = await response.json();

        if (session.status !== "ok") {
            window.location.replace("../login/Login.html");
        }
    } catch (error) {
        console.error("Não foi possível validar o acesso ao painel do organizador:", error);
        alert("Não foi possível validar sua sessão. Tente novamente.");
    }
});
