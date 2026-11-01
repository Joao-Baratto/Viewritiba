document.getElementById("formLogin").addEventListener("submit", async function (e) {
    e.preventDefault();

    const dados = new FormData(this);

    try {
        const retorno = await fetch("../php/valida_login.php", {
            method: "POST",
            body: dados
        });

        const resposta = await retorno.json();

        if (resposta.status === "ok") {
            window.location.href = "../home/index.html";
            return;
        }

        alert(resposta.mensagem);

    } catch (erro) {
        alert("Não foi possível realizar o login. Tente novamente.");
    }
});