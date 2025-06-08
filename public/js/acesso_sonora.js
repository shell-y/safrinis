fetch("/sonora/listar", {
    method: "GET"
}).then(resposta => {
    if (resposta.ok) {
        resposta
            .json()
            .then(json => {
                exibirListaArtistas(json);
            });
    }
}).catch(err => {
    console.log(err);
});

/*
fetch("/sonora/listar/pais", {
    method: "GET"
}).then(resposta => {
    if (resposta.ok) {
        resposta
            .json()
            .then(json => {
                console.log(json);
            });
    }
});
*/

function exibirListaArtistas(listaArtistas = [{}]) {
    const corpoTabela = document.querySelector("tbody");
    
    if (corpoTabela.hasChildNodes) {
        corpoTabela.innerHTML = '';
    }

    listaArtistas.forEach(artista => {
        corpoTabela.innerHTML += `
            <tr>
                <!-- <td></td> -->
                <td>${artista.id}</td>
                <td>${artista.nome}</td>
                <td>${decidirVazio(artista.qtdLineups)}</td>
                <td>${decidirVazio(artista.qtdDadosLastFm)}</td>
                <td>${decidirVazio(artista.qtdDadosSpotify)}</td>
            </tr>
        `
    });
}

function decidirVazio(numero = 0) {
    if (numero == 0) {
        return numero = ''
    }

    return numero;
}

document.querySelector("#legenda_tabela>button").addEventListener("click", e => {
    const infos = {
        nome: "Novo artista",
        idRelacionado: 1
    };

    registrarNovoArtista(infos);
});

function registrarNovoArtista(infos = {}) {   
    fetch("/sonora/criar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(infos) 
    }).then(resposta => {
        if (resposta.ok) alert("DEU BOM");
        else alert("slk checa ai");
    }).catch(err => {
        console.log(err)
    });
}

/*
document.querySelector("#btn_teste").addEventListener("click", e => {
    const infos = {
        id: '3',
        nome: 'nome do caboco',
        idRelacionado: '1'
    };
    
    registrarEditarArtista(infos);
});
*/

function registrarEditarArtista(infos = {}) {
    fetch("/sonora/editar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(infos)
    }).then(resposta => {
        if (resposta.ok) alert("deu bom");
        else alert("slk checa ai");
    }).catch(err => {
        console.log(err);
    })
}


document.querySelector("#btn_teste").addEventListener("click", e => { 
    executarDelete(4);
});

function executarDelete(idArtista = 0){
    fetch(`/sonora/deletar/${idArtista}`, {
        method: "DELETE"
    }).then(resposta => {
        if (resposta.ok) alert("deu bom");
        else alert("deu ruim");
    }).catch(erro => {
        console.log(erro);
    });
}