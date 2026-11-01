document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);
});
async function buscar(id){
    if (!id) {
        alert("ID do evento inválido.");
        window.location.href = "../home/index.html";
        return;
    }
    const retorno = await fetch("../php/evento_get.php?id="+id);
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
        var registro = resposta.data[0];
        document.getElementById("titulo").value = registro.titulo;
        document.getElementById("descricao").value = registro.descricao;
        document.getElementById("data_hora").value =
                registro.data_hora.replace(" ", "T").substring(0, 16);
        document.getElementById("local").value = registro.local;
         document.getElementById("id").value = id;
        carregar_categorias(registro.categorias_ids);
    }else{
        alert("ERRO:" + resposta.mensagem);
        window.location.href = "../home/";
    }
}
document.getElementById("enviar").addEventListener("click", () => {
    alterar();
});
async function alterar(){
    var titulo    = document.getElementById("titulo").value.trim();
    var descricao = document.getElementById("descricao").value.trim();
    var data_hora   = document.getElementById("data_hora").value;
    var local   = document.getElementById("local").value.trim();
    var id  = document.getElementById("id").value;
    var categorias = categorias_adicionadas;
    if (                           
        titulo === "" ||
        descricao === "" ||
        data_hora === "" ||
        local === ""
    ) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }
    if (categorias.length == 0) {
        alert("Selecione uma categoria.");
        return;
    }
    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descricao", descricao);
    fd.append("data_hora", data_hora);
    fd.append("local", local);
    categorias.forEach((id_categoria) => fd.append("categorias[]", id_categoria));
    const retorno = await fetch("../php/evento_alterar.php?id="+id, {
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
        window.location.href = '../home/'
    }else{
        alert("ERRO: " + resposta.mensagem);
    }
}
