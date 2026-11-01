document.getElementById("formOrganizador").addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const documento = document.getElementById("documento").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirmar_senha").value;

    // Validação de campos obrigatórios
    if (!nome || !documento || !email || !telefone || !senha || !confirmaSenha) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    if (senha !== confirmaSenha) {
        alert("As senhas não conferem!");
        return;
    }

    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres!");
        return;
    }

    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('documento', documento);
    fd.append('email', email);
    fd.append('telefone', telefone);
    fd.append('senha', senha);

    try {
        const retorno = await fetch("../php/organizador_novo.php", { 
            method: "POST", 
            body: fd 
        });
        const resposta = await retorno.json();

        if (resposta.status === "sucesso") {
            alert("Cadastro realizado com sucesso! Faça seu login.");
            window.location.href = "../login/Login.html";
        } else {
            alert("Erro: " + resposta.mensagem);
        }
    } catch (erro) {
        alert(erro.message || "Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    }
});