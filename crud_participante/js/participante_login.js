document.getElementById("formLogin").addEventListener("submit", async (event) => {
    event.preventDefault();

    const mensagem = document.getElementById("mensagem");
    if (mensagem) {
        mensagem.textContent = "";
    }

    try {
        const response = await fetch("../php/participante_login.php", {
            method: "POST",
            body: new FormData(event.currentTarget)
        });
        const result = await response.json();

        if (result.status === "banido") {
            window.location.replace(result.redirect || "../login/login.html");
            return;
        }

        if (!response.ok || result.status !== "sucesso") {
            throw new Error(result.mensagem || "Não foi possível realizar o login.");
        }

        window.location.replace("../home/painel.html");
    } catch (error) {
        if (mensagem) {
            mensagem.textContent = error.message || "Não foi possível conectar ao servidor. Tente novamente.";
        } else {
            alert(error.message || "Não foi possível conectar ao servidor. Tente novamente.");
        }
    }
});