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
                lastFmModel.getSomaPlaysPorPeriodo(idArtista, dias),
                lastFmModel.getSomaPlaysPorPeriodo(idArtista, dias, dias),
                lastFmModel.getSomaOuvintesPorPeriodo(idArtista, 7),
                lastFmModel.getSomaOuvintesPorPeriodo(idArtista, 14, 7),
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
    const artista = req.body.artistaServer;

    if (!artista) {
        return res.status(400).send("O campo 'artista' está undefined!");
    }

    artistaModel.buscarPorNome(artista).then((resultadoArtista) => {
        if (!resultadoArtista || resultadoArtista.length === 0) {
            return res.status(404).json({ erro: "Artista não encontrado" });
        }

        const idArtista = resultadoArtista[0].idArtista;

        artistaModel.buscarRelacionados(idArtista).then((relacionados) => {
            if (!relacionados || relacionados.length === 0) {
                return res.status(404).json({ erro: "Artistas relacionados não encontrados" });
            }

            const promessas = relacionados.map((rel) => {
                return lastFmModel.getSomaPlaysPorPeriodo(rel.idArtista, 90).then((plays) => {
                    return {
                        nome: rel.nome,
                        totalPlays: plays[0]?.plays || 0
                    };
                });
            });

            Promise.all(promessas)
                .then((relacionadosComPlays) => {
                    relacionadosComPlays.sort((a, b) => b.totalPlays - a.totalPlays);
                    res.status(200).json(relacionadosComPlays);
                });
        });
    }).catch((erro) => {
        console.error("Erro ao buscar artistas relacionados:", erro);
        res.status(500).json({ erro: "Erro interno ao buscar artistas relacionados" });
    });
}


function getPlays(req, res) {
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

            lastFmModel.getPlaysPorPeriodo(idArtista, dias)
                .then((playsDiarios) => {
                    if (!playsDiarios || playsDiarios.length === 0) {
                        return res.status(404).json({ erro: `Plays do artista ${artista} não encontrados` });
                    }

                    res.status(200).json(playsDiarios);
                })
                .catch((erro) => {
                    console.error("Erro ao buscar plays do artista em (getPLays()):", erro);
                    res.status(500).json({ erro: "Erro interno ao buscar plays do artista em (getPlays())" })
                });
        })
        .catch((erro) => {
            console.error("Erro ao buscar dados de Artista em (getPlays()):", erro);
            res.status(500).json({ erro: "Erro interno ao buscar artista em (getPlays())" });
        });
}

async function compararArtistas(req, res) {
    const { artistaA, artistaB } = req.body;

    if (!artistaA || !artistaB) {
        return res.status(400).send("Campos 'artistaA' e/ou 'artistaB' estão undefined.");
    }

    try {
        const [resA, resB] = await Promise.all([
            artistaModel.buscarPorNome(artistaA),
            artistaModel.buscarPorNome(artistaB)
        ]);

        if (!resA[0] || !resB[0]) {
            return res.status(404).json({ erro: "Um dos artistas não foi encontrado" });
        }

        const idA = resA[0].idArtista;
        const idB = resB[0].idArtista;

        const [dadosA, dadosB] = await Promise.all([
            getDadosComparativos(idA),
            getDadosComparativos(idB)
        ]);

        return res.status(200).json({
            [artistaA]: dadosA,
            [artistaB]: dadosB
        });

    } catch (erro) {
        console.error("Erro ao comparar artistas:", erro);
        return res.status(500).json({ erro: "Erro interno ao comparar artistas" });
    }
}

async function getDadosComparativos(idArtista) {
    const [playsHoje, totalPlays, popularidade] = await Promise.all([
        lastFmModel.getSomaPlaysPorPeriodo(idArtista, 1),
        lastFmModel.getSomaPlaysPorPeriodo(idArtista, 90),
        spotifyModel.getPopularidade(idArtista)
    ]);

    return {
        "Plays Diários": playsHoje[0]?.plays || 0,
        "Total de Plays": totalPlays[0]?.plays || 0,
        "Popularidade Spotify": popularidade[0]?.popularidade || 0
    };
}


module.exports = {
    getKpi,
    getArtistaRelacionado,
    getPlays,
    compararArtistas
};