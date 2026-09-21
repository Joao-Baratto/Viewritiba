document.addEventListener("DOMContentLoaded", () => {
    buscar();
    document.getElementById("filtro_data").addEventListener("change", aplicarFiltros);
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
document.getElementById("filtro_apagar").addEventListener("click", () => {
    document.getElementById("pesquisa").value = "";
    document.getElementById("filtro_data").value = "";
    buscar();
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
    aplicarFiltros();
}

function aplicarFiltros() {
    const data = document.getElementById("filtro_data").value;
    const titulo = document.getElementById("pesquisa").value.trim();
    const url = titulo
        ? "../php/evento_get.php?titulo=" + encodeURIComponent(titulo)
        : "../php/evento_get.php";

    fetch(url)
        .then(retorno => retorno.json())
        .then(resposta => {
            const eventos = resposta.status == "ok" ? resposta.data : [];
            const filtrados = data
                ? eventos.filter(evento => evento.data_hora.substring(0, 10) == data)
                : eventos;

            preencherTabela(filtrados);
            if (filtrados.length == 0) {
                document.getElementById("lista").innerHTML = "<p>Nenhum evento encontrado.</p>";
            }
        })
        .catch(() => {
            document.getElementById("lista").innerHTML = "<p>Não foi possível carregar os eventos.</p>";
        });
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
                <th> Ações </th>
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
                    <a href='../../crud_comentarios/home/comentarios.html?id=${tabela[i].id_evento}'>Comentários</a>

                    <a href='evento_alterar.html?id=${tabela[i].id_evento}'>Alterar</a>

                    <a href='#' onclick='favoritar_evento(${tabela[i].id_evento}); return false;'>Favoritar</a>
                    
                    <a href='#' onclick='excluir(${tabela[i].id_evento});return false;'>Excluir</a>
               </td>
            </tr>
        `;
    }
    html += '</table>';
    document.getElementById("lista").innerHTML = html;
}

function favoritar_evento(id_evento) {
    const dados = new FormData();
    dados.append("evento_id", id_evento);

    fetch("../../favoritos/favoritos_add.php", { method: "POST", body: dados })
        .then(retorno => retorno.json())
        .then(resposta => alert(resposta.mensagem))
        .catch(() => alert("Não foi possível favoritar o evento."));
}

