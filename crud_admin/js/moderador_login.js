document.getElementById("formLoginModerador").addEventListener("submit", async (event) => {
    event.preventDefault();

    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = "";

    try {
        const response = await fetch("php/moderador_login.php", {
            method: "POST",
            body: new FormData(event.currentTarget)
        });
        const result = await response.json();

        if (!response.ok || result.status !== "sucesso") {
            throw new Error(result.mensagem || "Não foi possível realizar o login.");
        }

        window.location.replace("painel.php");
    } catch (error) {
        mensagem.textContent = error.message;
    }
});
