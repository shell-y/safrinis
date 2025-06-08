//routes > CONTROLLER > model > database

const { bus } = require("nodemon/lib/utils");
var artistaModel = require("../models/artistaModel");

function buscarArtistas(req, res) {
    artistaModel.listarNomesArtistas()
        .then(
            resultado => {
                res.json(resultado);
            }
        )
        .catch(
            erro => {
                console.log("erro", erro);
                res.status(500).send();
            }
        )
}

function buscarDetalhes(req, res) {
    const idArtista = req.params.id;

    artistaModel.buscarDetalhesDoArtista(idArtista)
        .then(resultado => {
            if (resultado.length > 0) {
                res.json(resultado[0]);
            } else {
                res.status(404).send("Artista não encontrado.");
            }
        })
        .catch(erro => {
            console.error("Erro ao buscar detalhes:", erro);
            res.status(500).send();
        });
}

function listarRelacionados(req, res) {
  const id = req.params.id;

  artistaModel.listarRelacionados(id)
    .then(resultado => res.json(resultado))
    .catch(erro => {
      console.error("Erro ao buscar relacionados:", erro);
      res.status(500).send();
    });
}

// function salvarLineup(req, res) {
//   const { nomeLineup, idUsuario, artistas } = req.body;

//   artistaModel.salvarLineup(nomeLineup, idUsuario, artistas)
//     .then(() => res.status(200).send("Line-up salva."))
//     .catch(err => {
//       console.error("Erro ao salvar lineup:", err);
//       res.status(500).send("Erro ao salvar lineup.");
//     });
// }

function salvarLineup(req, res) {
  const { nomeLineup, idUsuario, artistas, idLineup } = req.body;

  artistaModel.salvarLineup(nomeLineup, idUsuario, artistas, idLineup)
    .then(() => res.status(200).send("Line-up salva."))
    .catch(err => {
      console.error("Erro ao salvar lineup:", err);
      res.status(500).send("Erro ao salvar lineup.");
    });
}


function renomearLineup(req, res) {
  const { idLineup, novoNome } = req.body;

  artistaModel.renomearLineup(idLineup, novoNome)
    .then(() => res.status(200).send("Renomeado"))
    .catch(err => {
      console.error("Erro ao renomear lineup:", err);
      res.status(500).send("Erro");
    });
}

function listarLineups(req, res) {
  const idUsuario = req.params.idUsuario;

  artistaModel.listarLineups(idUsuario)
    .then(result => res.json(result))
    .catch(err => {
      console.error("Erro ao buscar line-ups:", err);
      res.status(500).send("Erro ao buscar line-ups.");
    });
}

function buscarLineupPorId(req, res) {
  const idLineup = req.params.idLineup;

  artistaModel.buscarLineupPorId(idLineup)
    .then(resultado => res.json(resultado))
    .catch(erro => {
      console.error("Erro ao buscar lineup:", erro);
      res.status(500).send("Erro ao buscar lineup.");
    });
}

function excluirLineup(req, res) {
  const idLineup = req.params.idLineup;

  artistaModel.excluirLineup(idLineup)
    .then(() => res.status(200).send("Line-up excluída."))
    .catch(err => {
      console.error("Erro ao excluir line-up:", err);
      res.status(500).send("Erro ao excluir line-up.");
    });
}



module.exports = {
    buscarArtistas,
    buscarDetalhes,
    listarRelacionados,
    salvarLineup,
    renomearLineup,
    listarLineups,
    buscarLineupPorId,
    excluirLineup
};