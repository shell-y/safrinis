const database = require("../database/config");

function deletarRegistrosArtista(idArtista = 0){
    const instrucaoSql = `DELETE FROM LineupArtista WHERE fkArtista = ${idArtista};`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    deletarRegistrosArtista
}