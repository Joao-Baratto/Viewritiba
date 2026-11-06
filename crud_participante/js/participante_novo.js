document.getElementById("formParticipante").addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.currentTarget;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar_senha").value;

    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não conferem.");
        return;
    }

    try {
        const response = await fetch("../php/participante_novo.php", {
            method: "POST",
            body: new FormData(form)
        });
        const result = await response.json();

        if (!response.ok || result.status !== "sucesso") {
            alert("Erro: " + result.mensagem);
            return;
        }

        alert(result.mensagem + " Faça seu login.");
        window.location.href = "../login/login.html";
    } catch (error) {
        console.error("Erro ao cadastrar participante:", error);
        alert("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    }
});
