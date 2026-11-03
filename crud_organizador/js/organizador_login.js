document.getElementById("formLogin").addEventListener("submit", async function (e) {
	e.preventDefault();

	const dados = new FormData(this);

	try {
		const retorno = await fetch("../php/organizador_login.php", {
			method: "POST",
			body: dados
		});
		const resposta = await retorno.json();

		if (resposta.status === "banido") {
			window.location.replace(resposta.redirect);
			return;
		}

		if (resposta.status === "sucesso") {
			window.location.href = "../home/painel.html";
			return;
		}

		alert(resposta.mensagem);
	} catch (erro) {
		alert(erro.message || "Não foi possível realizar o login. Tente novamente.");
	}
});
