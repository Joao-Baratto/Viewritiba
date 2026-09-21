document.addEventListener("DOMContentLoaded", () => {
});
document.getElementById("enviar").addEventListener("click", () => {
    novo();
});
async function novo(){
    var titulo    = document.getElementById("titulo").value.trim();
    var descricao = document.getElementById("descricao").value.trim();
    var data_hora   = document.getElementById("data_hora").value;
    var local   = document.getElementById("local").value.trim();
    var id_organizador   = document.getElementById("id_organizador").value;
    if (   
    titulo === "" ||
    descricao === "" ||
    data_hora === "" ||
    local === "" ||
    id_organizador === ""
) {
    alert("Preencha todos os campos obrigatórios.");
    return;
}
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