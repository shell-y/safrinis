span_nome_usuario.innerText = sessionStorage.NOME_USUARIO

document.querySelector("#btn-login").addEventListener("click", e =>{
    sessionStorage.clear();
    location = "../index.html"
});

if(!sessionStorage.ID_USUARIO) {
    alert("Usuário não autenticado. Redirecionado para a página de login...");
    location = "../login.html"
} else {
    fetch(`/artista/lineups/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(resposta => {
        if (resposta.ok) {
            resposta
                .json()
                .then(json => {
                    exibirLineups(json);
                })
        }
    })
}

function exibirLineups(lineups = [{}]) {
    const sectionCards = document.querySelector("#section-cards");

    lineups.forEach(lineup => {
        sectionCards.innerHTML += `
            <div class="card" onclick="redirecionarLineUp(${lineup.idLineup})">${lineup.nomeLineup}</div>
        `
    });

    sectionCards.innerHTML += `
        <div class="card-adicionar" onclick="redirecionarLineUp(null)">+</div>
    `
}

// lineups.html -> checar  se tem sessionStorage com "lineup pré-selecionada"; 
// setar select e abrir()

function redirecionarLineUp(idLineup = 0) {
    sessionStorage.ID_LINEUP_SELECIONADA = idLineup;
    location = "./lineups.html";
}