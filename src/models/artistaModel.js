const database = require("../database/config");

function buscarPorNome(nome = "") {
    const instrucaoSql = `
        SELECT * FROM Artista WHERE nome = '${nome}';
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarRelacioadosQtdLineups() {
    const instrucaoSql = `
        SELECT
            a.idArtista,
            a.nome as nomeArtista,
            CASE
                WHEN a.nome = r.nome
                THEN ''
                ELSE a.nome
            END as nomeRelacionado,
            count(la.fkArtista) as qtdLineups
        FROM Artista as a
        JOIN Artista as r
            ON r.idArtista = a.fkRelacionadoA
        LEFT JOIN LineupArtista as la
            ON la.fkArtista = a.idArtista
        GROUP BY
            a.idArtista, a.nomeArtista;
    `;

    console.log("Executaando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizar(infos = {}) {
    const instrucaoSql = `
        UPDATE Artista SET
            nome = '${infos.nome}',
            fkRelacionaodoA = ${infos.fkRelacionadoA}
        WHERE idArtista = ${infos.id};
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarPais() {
    const instrucaoSql = `
        SELECT * FROM Artista WHERE idArtista = idArtista;
    `

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletar(idArtista = 0) {
    const instrucaoSql = `DELETE FROM Artista WHERE idArtista = ${idArtista};`

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarPorNome,
    listarRelacioadosQtdLineups,
    atualizar,
    listarPais,
    deletar
};