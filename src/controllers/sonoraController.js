const artistaModel = require("../models/artistaModel");

function listar(req, res) {
    artistaModel
        .listarQtdDados()
        .then(resultado => {
            if (resultado.length > 0) res.json(resultado);
        })
        .catch(erro => {
            console.log(erro)
            res.status(500).send();
        });
}

function listarPais(req, res) {
    console.log("Listando artistas pais...")
    artistaModel
        .listarPais()
        .then(resultado => {
            if (resultado.length > 0) res.json(resultado);
        })
        .catch(erro => {
            console.log(erro)
            res.status(500).send();
        });
}

function criar(req, res) {
    console.log("Criando novo artista...")

    if (!req.body) {
        return res.status(400).send("Body undefined!")
    }
    
    artistaModel
        .criar(req.body)
        .then(resposta => {
            if (resposta.serverStatus == 2) res.status(200).send();
        })
        .catch(erro => {
            console.log(erro)
            res.status(500).send();
        });
}

function editar(req, res) {

    if(!req.body) {
        return res.status(400).send("Body undefined!")
    }

    artistaModel
        .editar(req.body)
        .then(resposta => {
            if (resposta.serverStatus == 2) res.status(200).send();
        })
        .catch(erro => {
            console.log(erro)
            res.status(500).send();
        });
}

async function deletar(req, res) {
    const idArtista = req.params.idArtista;

    if(isNaN(idArtista)) {
        return res.status(400).send("Não foi passado um número!");
    }

    const models = {
        LineUpArtista: require("../models/lineupArtistaModel"),
        LastFm: require("../models/lastFmModel"),
        Spotify: require("../models/spotifyModel")
    };
    
    try {
        let sucesso = true

        for(const key of Object.keys(models)) {
            const remocao = await models[key].deletarRegistrosArtista(idArtista);
            
            if (remocao.serverStatus !== 2) {
                console.log(`deu ruim no model ${models[key]}:\n${remocao}`)
                sucesso = false;
                break
            }
        }

        if (sucesso) {
            const remocao = await artistaModel.deletar(idArtista);
            if (remocao.serverStatus === 2) res.status(200).send();
            else {
                console.log(`deu ruim na hora de deletar o artista:\n${remocao}`)
                res.status(400).send();
            }
        } else {
            console.log(remocao)
            res.status(400).send("");
        }

    } catch (erro) {
        console.log(erro);
        res.status(500).send();
    }
        
}

module.exports = {
    listar,
    listarPais,
    criar,
    editar,
    deletar
}