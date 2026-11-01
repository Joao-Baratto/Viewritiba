document.getElementById("formLogin").addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
        const response = await fetch("../php/participante_login.php", {
            method: "POST",
            body: new FormData(event.currentTarget)
        });
        const result = await response.json();

        if (response.ok && result.status === "sucesso") {
            window.location.href = "../home/painel.html";
            return;
        }

        alert(result.mensagem);
    } catch (error) {
        console.error("Erro ao realizar login do participante:", error);
        alert("Não foi possível realizar o login. Tente novamente.");
    }
});