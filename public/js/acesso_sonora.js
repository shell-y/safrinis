fetch("/sonora/listar", {
    method: "GET"
}).then(resposta => {
    if (resposta.ok) {
        resposta
            .json()
            .then(json => {
                localStorage.ARTISTAS = JSON.stringify(json);
                exibirListaArtistas(json);
            });
    }
}).catch(err => {
    console.log(err);
});

function exibirListaArtistas(listaArtistas = [{}]) {
    const corpoTabela = document.querySelector("tbody");
    
    if (corpoTabela.hasChildNodes) {
        corpoTabela.innerHTML = '';
    }

    listaArtistas.forEach(artista => {
        corpoTabela.innerHTML += `
            <tr>
                <td>${artista.id}</td>
                <td class="celula-texto">${artista.nome}</td>
                <td>${artista.qtdLineups/2}</td>
                <td>${artista.qtdDadosLastFm}</td>
                <td>${artista.qtdDadosSpotify}</td>
                <td class="celula-acao" onclick="mostrarModal('Editar', ${artista.id})">Editar</td>
                <td class="celula-acao" onclick="executarDelete(${artista.id})">Excluir</td>
            </tr>
        `
    });
}

function mostrarModal(operacao = '', idArtista = 0) {
    const inpModal = document.querySelector("#inp_nome_artista");
    
    if (operacao == 'Editar') {
        const artista = JSON.parse(localStorage.ARTISTAS).find(artista => artista.id === idArtista);

        inpModal.value = artista.nome
        inpModal.setAttribute("name", artista.id)
    } else {
        inpModal.value = "";
    }

    document.querySelector("#modal span").innerHTML = operacao;
    document.querySelector("#modal").style.display = "block";
}

function cancelarModal() {
    document.querySelector("#modal").style.display = "none";
}

function enviarRequisicao() {
    const inpNome = document.querySelector("#inp_nome_artista");

    const infos = {
        id: inpNome.name,
        nome: inpNome.value,
        idRelacionado: null
    }

    if (inpNome.hasAttribute("name")) {
        registrarEditarArtista(infos);
    } else {
        registrarNovoArtista(infos);
    }
}

function registrarNovoArtista(infos = {}) {   
    fetch("/sonora/criar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(infos) 
    }).then(resposta => {
        if (resposta.ok) {
            alert("Artista registrado!");
            location.reload();
        } else {
            alert("Houve um erro!");
        }   
    }).catch(err => {
        alert("Houve um erro!")
    });
}

function registrarEditarArtista(infos = {}) {
    fetch("/sonora/editar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(infos)
    }).then(resposta => {
        if (resposta.ok) {
            alert("Artista editado");
            location.reload();
        } else {
            alert("Houve um erro!");
        }
    }).catch(err => {
        alert("Houve um erro!");
    })
}

function executarDelete(idArtista = 0){
    const exclusao = confirm("Tem certeza que deseja deletar o artista? Essa ação afetará todo o banco de dados e não poderá ser desfeita.")

    if(!exclusao) {
        return;
    }

    fetch(`/sonora/deletar/${idArtista}`, {
        method: "DELETE"
    }).then(resposta => {
        if (resposta.ok) {
            alert("Exclusão bem sucedida.")
            location.reload();
        } else {
            alert("Houve um erro!")
        } 
    }).catch(erro => {
        console.log(erro);
    });
}