const database = require("../database/config");

function getSomaPlaysPorPeriodo(idArtista, dias, offsetDias = 0) {
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

function getSomaOuvintesPorPeriodo(idArtista, dias, offsetDias = 0) {
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

function getPlaysPorPeriodo(idArtista, dias){
    const dataAtual = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(dataAtual.getDate() - dias);
    const dataFim = new Date();

    const instrucaoSql = `
    SELECT DATACOLETA, TOTALPLAYS
    FROM LASTFM 
        WHERE FKARTISTA = ${idArtista} 
            AND DATE(DATACOLETA) >= '${dataInicio.toISOString().slice(0,10)}'
            AND DATE(DATACOLETA) <= '${dataFim.toISOString().slice(0,10)}'
        ORDER BY DATACOLETA;`
}

function deletarRegistrosArtista(idArtista = 0) {
    const instrucaoSql = `
        DELETE from LastFm where fkArtista = ${idArtista};
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    getSomaPlaysPorPeriodo,
    getSomaOuvintesPorPeriodo,
    getPlaysPorPeriodo,
    getOnTour,
    getOnTour,
    deletarRegistrosArtista
};
