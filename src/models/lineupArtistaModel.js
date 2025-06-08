const database = require("../database/config");

function deletarRegistro(infos = {}) {
    const instrucaoSql = `
        DELETE FROM LineupArtista
        WHERE
            fkLineup = ${infos.idLineup},
            fkUsuario = ${infos.idUsuario},
            fkArtista = ${infos.idArtista};
    `;

    console.log("Eecutando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletarRegistrosArtista(idArtista = 0){
    const instrucaoSql = `DELETE FROM LineupArtista WHERE fkArtista = ${idArtista}`;

    console.log("Eecutando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    deletarRegistrosArtista
}