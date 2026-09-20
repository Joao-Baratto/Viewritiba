document.getElementById("enviar").addEventListener("click", () => {
    login();
});
async function login(){
    var email = document.getElementById("usuario").value.trim();
    var senha = document.getElementById("senha").value;
    if (email === "" || senha === "") {
        alert("Informe o e-mail e a senha.");
        return;
    }
    const fd = new FormData();
    fd.append("email", email);
    fd.append("senha", senha);
    const retorno = await fetch("../php/valida_login.php", {
        method: "POST",
        body: fd
        credentials: "same-origin"
    });
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        window.location.href = "../home/index.html";
    } else {
        alert("ERRO: " + resposta.mensagem);
    }
}