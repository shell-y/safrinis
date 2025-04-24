var database = require("../database/config");

function buscarLineupPorUsuario(id){
    var instrucaoSql = `SELECT * FROM Lineup WHERE idUsuario = ${id}`;

    console.log("Eecutando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarLineupPorUsuario
}