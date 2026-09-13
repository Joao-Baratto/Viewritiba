<<<<<<< HEAD
let elementos_tela;
const role = localStorage.getItem("role");
localStorage.setItem("role", "admin")
document.addEventListener("DOMContentLoaded", () => {
    elementos_tela = document.getElementById("elementos_tela");
    const new_evento = document.getElementById("new_evento");
    const filtro_data = document.getElementById("filtro_data");
    const filtro_apagar = document.getElementById("filtro_apagar");
    if (role != "admin" && role != "organizador") {
    new_evento.style.display = "none";
}
    if (new_evento){
        new_evento.addEventListener("click", (e) => {
            e.preventDefault();
            novo_evento();
        })
    }
    if (filtro_data){
        filtro_data.addEventListener("click", (e) => {
            e.preventDefault();
            filtrar_eventos();
        })
    };
    if (filtro_apagar){
        filtro_apagar.addEventListener("click", (e) => {
            e.preventDefault();
            apagar_fitro();
        })
    };
    renderizar();
})
function novo_evento() {
    window.location.href = 'evento_add.html';
};
function visitar_evento(e, id){
    window.location.href = `visualizar_evento.html?id=${id}`;
};
function apagar_fitro(){
    window.location.href = 'eventos.html'
};
function filtrar_eventos() {
    const data = document.getElementById("filtro_data").value;
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const eventos_filtrados = eventos.filter(evento => evento.data == data);
    elementos_tela.innerHTML = "";
    eventos_filtrados.forEach(evento => {
        elementos_tela.innerHTML += `
            <div>
                <h3>${evento.nome} - ${evento.data}</h3>
                <div>${evento.descricao}</div>
                <button onclick="visitar_evento(this, ${evento.id})">
                    Visitar evento
                </button>
            </div>
        `;
    });
}
function renderizar(){
    const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
    elementos_tela.innerHTML = "";
    eventos.sort((a, b) => new Date(a.data) - new Date(b.data));
    eventos.forEach(evento => {
        let btn_excluir = "";
        let btn_alterar = "";
        const btn_visitar = `<button type="button" onclick="visitar_evento(this, ${evento.id})">Visitar evento</button>`;
        if (role == "admin"){
            btn_excluir = `<button type = "button" >Excluir</button>`;
            btn_alterar = `<button type = "button" >Alterar</button>`
        }
        if (new Date(evento.data).getTime() >= Date.now()){
            elementos_tela.innerHTML += `
            <div>
                <small>${evento.data}</small>
                <h2>${evento.nome}</h2>
                <div class="actions-row">
                    ${btn_visitar}
                    ${btn_alterar} ${btn_excluir}
                </div>
            </div>
            `;
        }
    });
=======
let elementos_tela;
document.addEventListener("DOMContentLoaded", () => {
    elementos_tela = document.getElementById("elementos_tela");
    const new_evento = document.getElementById("new_evento");
    const filtro_data = document.getElementById("filtro_data");
    const filtro_apagar = document.getElementById("filtro_apagar");
    if (new_evento){
        new_evento.addEventListener("click", (e) => {
            e.preventDefault();
            novo_evento();
        })
    }
    if (filtro_data){
        filtro_data.addEventListener("click", (e) => {
            e.preventDefault();
            filtrar_eventos();
        })
    };
    if (filtro_apagar){
        filtro_apagar.addEventListener("click", (e) => {
            e.preventDefault();
            apagar_fitro();
        })
    };
    renderizar();
})
function novo_evento() {
    window.location.href = 'evento_add.html';
};
function visitar_evento(e, id){
    window.location.href = `visualizar_evento.html?id=${id}`;
};
function apagar_fitro(){
    window.location.href = 'eventos.html'
};
function filtrar_eventos() {
    const data = document.getElementById("filtro_data").value;
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const eventos_filtrados = eventos.filter(evento => evento.data == data);
    elementos_tela.innerHTML = "";
    eventos_filtrados.forEach(evento => {
        elementos_tela.innerHTML += `
            <div>
                <h3>${evento.nome} - ${evento.data}</h3>
                <div>${evento.descricao}</div>
                <button onclick="visitar_evento(this, ${evento.id})">
                    Visitar evento
                </button>
                <hr>
            </div>
        `;
    });
}
function renderizar(){
    const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
    elementos_tela.innerHTML = "";
    eventos.sort((a, b) => new Date(a.data) - new Date(b.data));
    eventos.forEach(evento => {        
        elementos_tela.innerHTML += `<div><h3>${evento.nome} - ${evento.data}</h3>
                                    <div><button type="button" onclick="visitar_evento(this, ${evento.id})">Visitar evento</button></div>
                                    <hr>
        </div>
        `;
    });
>>>>>>> 517759e (Adiciona validação de sessão e atualiza CSS)
}