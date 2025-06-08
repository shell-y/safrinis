const database = require("../database/config");

function getPlaysPorPeriodo(idArtista, dias, offsetDias = 0) {
    const dataAtual = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(dataAtual.getDate() - dias - offsetDias);
    const dataFim = new Date();
    dataFim.setDate(dataAtual.getDate() - offsetDias);

    const instrucaoSql = `
        SELECT SUM(plays) as plays 
        FROM LastFm 
        WHERE fkArtista = '${idArtista}' AND 
        dataColeta BETWEEN '${dataInicio.toISOString().slice(0,10)}' AND 
        '${dataFim.toISOString().slice(0,10)}';
        `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getOuvintesPorPeriodo(idArtista, dias, offsetDias = 0) {
    const dataAtual = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(dataAtual.getDate() - dias - offsetDias);
    const dataFim = new Date();
    dataFim.setDate(dataAtual.getDate() - offsetDias);

    const instrucaoSql = `
        SELECT SUM(ouvintes) as ouvintes 
        FROM LastFm 
        WHERE fkArtista = '${idArtista}' AND 
        dataColeta BETWEEN '${dataInicio.toISOString().slice(0,10)}' AND 
        '${dataFim.toISOString().slice(0,10)}';
        `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getOnTour(idArtista) {
    const instrucaoSql = `
        SELECT onTour FROM LastFm WHERE fkArtista = '${idArtista}' ORDER BY dataColeta DESC LIMIT 1;
        `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletarRegistrosArtista(idArtista = 0) {
    const instrucaoSql = `
        DELETE from LastFm where idArtista = ${idArtista};
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    getPlaysPorPeriodo,
    getOuvintesPorPeriodo,
    getOnTour,
    deletarRegistrosArtista
};
