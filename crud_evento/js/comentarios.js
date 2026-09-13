const url_comentarios = new URLSearchParams(window.location.search);
const id_evento = url_comentarios.get("id");
let elementos_tela;
document.addEventListener("DOMContentLoaded", () => {
    elementos_tela = document.getElementById("elementos_tela");
    const btn_voltar = document.getElementById("btn_voltar");
    const btn_comentario = document.getElementById("btn_comentario");
    if (btn_voltar){
        btn_voltar.addEventListener("click", (e) => {
            e.preventDefault();
            voltar();
        })
    if (btn_comentario) {
        btn_comentario.addEventListener("click", (e) =>{
            e.preventDefault();
            enviar();
        })
    }}
    renderizar_comentarios();
})
function enviar() {
    const id_comentario = id_evento + Date.now();
    const usuario = "Testeiro"
    const descricao = document.getElementById("new_comentario").value;
    const agora = new Date();
    const datetimeUTC = agora.toISOString().replace('T', ' ').substring(0, 19);
    const comentario = {
        id_evento : id_evento,
        id: id_comentario,
        data : datetimeUTC,
        usuario: usuario,
        comentario: descricao,
    };
    let comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];
    comentarios.push(comentario);
    localStorage.setItem('comentarios', JSON.stringify(comentarios));
    window.location.href = `visualizar_evento.html?id=${id_evento}`;
};
function renderizar_comentarios(){
    const comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];
    const role = localStorage.getItem("role");
    elementos_tela.innerHTML = "";
    comentarios.sort((a, b) => new Date(b.data) - new Date(a.data));
    comentarios.forEach(comentario => {
        if (comentario.id_evento == id_evento) {
        let btn_excluir = "";
        let btn_alterar = "";
        if (role == "admin"){
            btn_excluir = `<button type = "button">Excluir</button>`;
            btn_alterar = `<button type = "button">Alterar</button>`
        }
        elementos_tela.innerHTML += `<div><little>${comentario.data}</little>
                                    <h2>${comentario.usuario}</h2>
                                    <p>${comentario.comentario}</p>
                                    <div class="actions-row">
                                        ${btn_alterar} ${btn_excluir}
                                    </div>
                                    </div>
        </div>
        `;
    }
    });
}
function voltar() {
    window.location.href = 'eventos.html';
};