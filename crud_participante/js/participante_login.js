document.getElementById("formLogin").addEventListener("submit", async (event) => {
    event.preventDefault();

    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = "";

    try {
        const response = await fetch("../php/participante_login.php", {
            method: "POST",
            body: new FormData(event.currentTarget)
        });
        const result = await response.json();

        if (result.status === "banido") {
            window.location.replace(result.redirect);
            return;
        }

        if (!response.ok || result.status !== "sucesso") {
            throw new Error(result.mensagem || "Não foi possível realizar o login.");
        }

        window.location.replace("../../crud_evento/home/catalogo.html");
    } catch (error) {
        mensagem.textContent = error.message || "Não foi possível conectar ao servidor. Tente novamente.";
    }
});