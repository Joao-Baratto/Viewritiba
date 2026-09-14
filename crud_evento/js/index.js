document.addEventListener("DOMContentLoaded", () => {
    buscar();
});
document.getElementById("novo").addEventListener("click", () => {
    window.location.href = 'evento_novo.html';
});
document.getElementById("logoff").addEventListener("click", () => {
    logoff();
});
document.getElementById("buscar").addEventListener("click", () => {
    pesquisar();
});
async function logoff() {
    const retorno = await fetch("../php/evento_logoff.php");
    const resposta = await retorno.json();

    console.log(resposta);

    if (resposta.status == "ok") {
        window.location.replace("../login/index.html");
    }
}
async function buscar(){
    const retorno = await fetch("../php/evento_get.php");
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        preencherTabela(resposta.data);    
    } else {
        document.getElementById("lista").innerHTML =
            "<p>Nenhum evento cadastrado.</p>";
    }
}
async function pesquisar() {
    const titulo = document.getElementById("pesquisa").value;
    const retorno = await fetch(
        "../php/evento_get.php?titulo=" + encodeURIComponent(titulo)
    );
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        preencherTabela(resposta.data);
    } else {
        document.getElementById("lista").innerHTML =
            "<p>Nenhum evento encontrado.</p>";
    }
}
async function excluir(id){
    if (!confirm("Tem certeza que deseja excluir este evento?")) {
        return;
    }
    const retorno = await fetch("../php/evento_excluir.php?id=" + id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert(resposta.mensagem);
        buscar();
    }else{
        alert(resposta.mensagem);
    }
}

function alterar_evento(id_evento){
    if (!id_evento) {
        alert("ID do evento não encontrado.");
        return;
    }
    window.location.href = "evento_alterar.html?id=" + id_evento;
}
function preencherTabela(tabela){
    var html = `
        <table>
            <tr>
                <th> Título </th>
                <th> Descrição </th>
                <th> Data e Hora </th>
                <th> Local </th>
                <th> ID Organizador </th>
            </tr>
    `;
    for(var i=0;i<tabela.length;i++){
        html += `
            <tr>
                <td>${tabela[i].titulo}</td>
                <td>${tabela[i].descricao}</td>
                <td>${tabela[i].data_hora}</td>
                <td>${tabela[i].local}</td>
                 <td>${tabela[i].id_organizador}</td>
                <td>
                    <a href='visualizar_evento.html?id=${tabela[i].id_evento}'>Visualizar Evento</a>
                    <a href='evento_alterar.html?id=${tabela[i].id_evento}'>Alterar</a>
                    <a href='#' onclick='excluir(${tabela[i].id_evento})'>Excluir</a>
               </td>
            </tr>
        `;
    }
    html += '</table>';
    document.getElementById("lista").innerHTML = html;
}

