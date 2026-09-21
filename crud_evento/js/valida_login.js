document.getElementById("enviar").addEventListener("click", () => login());
    alert("clicou");
async function login(){
    var email = document.getElementById("usuario").value;
    var senha = document.getElementById("senha").value;
    const fd = new FormData();
    fd.append("email", email);
    fd.append("senha", senha);
    const retorno = await fetch("../php/valida_login.php",{
            method: "POST",
            body: fd
        }
    );
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        window.location.href = "../home/index.html";
    }else{
        alert("Credenciais invalidas.");
    }
}