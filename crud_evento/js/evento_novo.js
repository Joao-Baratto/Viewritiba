document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    carregar_categorias();
});
document.getElementById("enviar").addEventListener("click", () => {
    novo();
});
async function novo(){
    var titulo    = document.getElementById("titulo").value;
    var descricao = document.getElementById("descricao").value;
    var data_hora   = document.getElementById("data_hora").value;
    var local   = document.getElementById("local").value;
    var categorias = categorias_adicionadas;

    if (
        titulo == "" ||
        descricao == "" ||
        data_hora == "" ||
        local == "" ||
        categorias.length == 0
    ) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    if (new Date(data_hora) <= new Date()) {
        alert("Preencha uma data válida.");
        return;
    }

    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descricao", descricao);
    fd.append("data_hora", data_hora);
    fd.append("local", local);
    categorias.forEach((id) => fd.append("categorias[]", id));
    const retorno = await fetch("../php/evento_novo.php",
        {
          method: 'POST',
          body: fd  
        });
    const resposta = await retorno.json();
    if (resposta.status == "banido") {
        window.location.replace(resposta.redirect);
        return;
    }
    if (retorno.status == 401) {
        window.location.href = "../../crud_organizador/login/Login.html";
        return;
    }
    if(resposta.status == "ok"){
        alert("SUCESSO: " + resposta.mensagem);
        window.location.href = "../home/";
    }else{
        alert("ERRO: " + resposta.mensagem);
    }
}