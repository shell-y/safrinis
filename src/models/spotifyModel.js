const database = require("../database/config");

function getPopularidade(idArtista){
    const instrucaoSql = `
    SELECT popularidade FROM Spotify WHERE fkArtista = '${idArtista}' ORDER BY dtRequisicao DESC LIMIT 1;
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletarRegistrosArtista(idArtista = 0) {
    const instrucaoSql = `
       DELETE FROM Spotify WHERE fkArtista = ${idArtista}; 
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    getPopularidade,
    deletarRegistrosArtista
};