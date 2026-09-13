document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);
});
async function buscar(id){
    const retorno = await fetch("../php/evento_get.php?id="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert("SUCESSO:" + resposta.mensagem);
        var registro = resposta.data[0];
        document.getElementById("titulo").value = registro.titulo;
        document.getElementById("descricao").value = registro.descricao;
        document.getElementById("data_hora").value =
                registro.data_hora.replace(" ", "T").substring(0, 16);
        document.getElementById("local").value = registro.local;
        document.getElementById("id_organizador").value = registro.id_organizador;        document.getElementById("id").value = id;
    }else{
        alert("ERRO:" + resposta.mensagem);
        window.location.href = "../home/";
    }
}
document.getElementById("enviar").addEventListener("click", () => {
    alterar();
});
async function alterar(){
    var titulo    = document.getElementById("titulo").value;
    var descricao = document.getElementById("descricao").value;
    var data_hora   = document.getElementById("data_hora").value;
    var local   = document.getElementById("local").value;
    var id_organizador  = document.getElementById("id_organizador").value;
    var id  = document.getElementById("id").value;
    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descricao", descricao);
    fd.append("data_hora", data_hora);
    fd.append("local", local);
    fd.append("id_organizador", id_organizador);
    const retorno = await fetch("../php/evento_alterar.php?id="+id, {
          method: 'POST',
          body: fd  
        });
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert("SUCESSO: " + resposta.mensagem);
        window.location.href = '../home/'
    }else{
        alert("ERRO: " + resposta.mensagem);
    }
}
