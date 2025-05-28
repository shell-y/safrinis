const artistaModel = require("../models/artistaModel");
const spotifyModel = require("../models/spotifyModel");
const lastFmModel = require("../models/lastFmModel");

function getKpi(req, res) {
    const artista = req.body.artistaServer;
    const periodo = req.body.periodoServer;

    if (!artista) {
        return res.status(400).send("O campo 'artista' está undefined!");
    }

    if (!periodo) {
        return res.status(400).send("O campo 'periodo' está undefined!");
    }

    artistaModel.buscarPorNome(artista)
        .then((resultadoArtista) => {
            if (!resultadoArtista || resultadoArtista.length === 0) {
                return res.status(404).json({ erro: "Artista não encontrado" });
            }

            const idArtista = resultadoArtista[0].idArtista;
            const dias = parseInt(periodo);

            return Promise.all([
                lastFmModel.getPlaysPorPeriodo(idArtista, dias),
                lastFmModel.getPlaysPorPeriodo(idArtista, dias, dias),
                lastFmModel.getOuvintesPorPeriodo(idArtista, 7),
                lastFmModel.getOuvintesPorPeriodo(idArtista, 14, 7),
                spotifyModel.getPopularidade(idArtista),
                lastFmModel.getOnTour(idArtista)
            ])
                .then(([playsAtual, playsAnterior, ouvintesAtual, ouvintesAnterior, popularidade, onTour]) => {
                    const playsA = playsAtual[0]?.plays || 0;
                    const playsB = playsAnterior[0]?.plays || 0;
                    const ouvintesA = ouvintesAtual[0]?.ouvintes || 0;
                    const ouvintesB = ouvintesAnterior[0]?.ouvintes || 0;

                    const crescimentoPlays = playsB > 0 ? ((playsA - playsB) / playsB) * 100 : 100;
                    const crescimentoOuvintes = ouvintesB > 0 ? ((ouvintesA - ouvintesB) / ouvintesB) * 100 : 100;

                    const kpis = {
                        crescimentoPlays: crescimentoPlays.toFixed(2),
                        crescimentoOuvintes: crescimentoOuvintes.toFixed(2),
                        popularidade: popularidade[0]?.popularidade || 0,
                        onTour: onTour[0]?.onTour === 1
                    };

                    res.status(200).json(kpis);
                });
        })
        .catch((erro) => {
            console.error("Erro ao buscar dados de KPI:", erro);
            res.status(500).json({ erro: "Erro interno ao calcular KPIs" });
        });
}

function getArtistaRelacionado(req, res) {
    const artista = req.body.artistaServer

    if (!artista) {
        return res.status(400).send("O campo 'artista' está undefined!");
    }

    artistaModel.buscarPorNome(artista)
        .then((resultadoArtista) => {
            if (!resultadoArtista || resultadoArtista.length === 0) {
                return res.status(404).json({ erro: "Artista não encontrado" });
            }

            const idArtista = resultadoArtista[0].idArtista;

            artistaModel.buscarRelacionados(idArtista)
                .then((relacionados) => {
                    if(!relacionados || relacionados.length === 0){
                        return res.status(404).json({ erro: "Artistas Relacionados não encontrados" });
                    }

                    res.status(200).json(relacionados); 
                })
                .catch((erro) => {
                    console.error("Erro ao buscar artistas relacionados:", erro);
                    res.status(500).json({erro: "Erro interno ao buscar artistas relacionados"})
                });
        })
        .catch((erro) => {
            console.error("Erro ao buscar dados de Artista em (getArtistaRelacionado()):", erro);
            res.status(500).json({erro: "Erro interno ao buscar artista em (getArtistaRelacionado())"});
        });
}

module.exports = {
    getKpi,
    getArtistaRelacionado
};