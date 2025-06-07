var database = require("../database/config");

function deletarRegistrosArtista(idArtista = 0){
    const instrucaoSql = `REMOVE FROM LineupArtista WHERE fkArtista = ${idArtista}`;

    console.log("Eecutando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    deletarRegistrosArtista
}