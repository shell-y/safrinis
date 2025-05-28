    const database = require("../database/config");

    function buscarPorNome(nome) {
        const instrucaoSql = `
        SELECT * FROM Artista WHERE nome = '${nome}';
        `;

        console.log("Executando a instrução SQL: " + instrucaoSql);
        return database.executar(instrucaoSql);
    }
    
    function buscarRelacionados(artistaId){
        const instrucaoSql = `
        SELECT * FROM ARTISTA WHERE FKRELACIONADOA = ${artistaId};
        `

        console.log("Executando a instrução SQL: " + instrucaoSql);
        return database.executar(instrucaoSql);
    }

    module.exports = {
        buscarPorNome,
        buscarRelacionados
    };