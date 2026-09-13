document.addEventListener("DOMContentLoaded", () => {
});
document.getElementById("enviar").addEventListener("click", () => {
    novo();
});
async function novo(){
    var titulo    = document.getElementById("titulo").value;
    var descricao = document.getElementById("descricao").value;
    var data_hora   = document.getElementById("data_hora").value;
    var local   = document.getElementById("local").value;
    var id_organizador   = document.getElementById("id_organizador").value;
    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descricao", descricao);
    fd.append("data_hora", data_hora);
    fd.append("local", local);
    fd.append("id_organizador", id_organizador);
    const retorno = await fetch("../php/evento_novo.php",
        {
          method: 'POST',
          body: fd  
        });
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert("SUCESSO: " + resposta.mensagem);
        window.location.href = "../home/";
    }else{
        alert("ERRO: " + resposta.mensagem);
    }
}