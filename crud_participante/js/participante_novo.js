document.getElementById("formParticipante").addEventListener("submit", async function (e) {
    e.preventDefault();

    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirmar_senha").value;

    if (senha !== confirmaSenha) {
        alert("As senhas não conferem!");
        return;
    }

    if (senha.length !== 6) {
        alert("A senha deve ter exatamente 6 caracteres!");
        return;
    }

    try {
        const response = await fetch("../php/participante_novo.php", {
            method: "POST",
            body: new FormData(e.currentTarget)
        });
        const result = await response.json();

        if (!response.ok || result.status !== "sucesso") {
            throw new Error(result.mensagem || "Não foi possível concluir o cadastro.");
        }

        alert(result.mensagem + " Faça seu login.");
        window.location.href = "../login/login.html";
    } catch (error) {
        alert(error.message || "Não foi possível conectar ao servidor. Tente novamente.");
    }
});