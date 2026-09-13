document.getElementById("formOrganizador").addEventListener("submit", function (e) {
    e.preventDefault();

    var senha = document.getElementById("senha").value;
    var confirmaSenha = document.getElementById("confirmar_senha").value;

    if (senha !== confirmaSenha) {
        alert("As senhas não conferem!");
        return false;
    }

    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres!");
        return false;
    }

    novo();
});

async function novo() {

    var nome = document.getElementById("nome").value;
    var documento = document.getElementById("documento").value;
    var email = document.getElementById("email").value;
    var telefone = document.getElementById("telefone").value;
    var senha = document.getElementById("senha").value;

    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('documento', documento);
    fd.append('email', email);
    fd.append('telefone', telefone);
    fd.append('senha', senha);

    const retorno = await fetch("../php/organizador_novo.php", { method: "POST", body: fd });
    const resposta = await retorno.json();

    if (resposta.status == "sucesso") {
        alert("Sucesso: " + resposta.mensagem);
        window.location.href = "../login/Login.html";
    } else {
        alert("Erro: " + resposta.mensagem);
        
    }
}