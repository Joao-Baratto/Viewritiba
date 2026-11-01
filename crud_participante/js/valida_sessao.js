fetch("../crud_participante/php/valida_sessao.php")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Falha ao validar sessão.");
        }
        return response.json();
    })
    .then(function (result) {
        if (result.status !== "ok") {
            window.location.href = "../crud_participante/login/login.html";
        }
    })
    .catch(function (error) {
        console.error("Erro ao validar sessão do participante:", error);
        window.location.href = "../crud_participante/login/login.html";
    });