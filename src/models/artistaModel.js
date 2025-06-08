const database = require("../database/config");

function criar(infos = {}) {
    const instrucaoSql = `
        INSERT INTO Artista VALUE
            (default, '${infos.nome}', ${infos.idRelacionado});
    `

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPorNome(nome = "") {
    const instrucaoSql = `
        SELECT * FROM Artista WHERE nome = '${nome}';
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

function listarQtdDados() {
    const instrucaoSql = `
        SELECT
            a.idArtista as id,
            a.nome,
            COUNT(DISTINCT r.idArtista) AS qtdRelacionados,
            COUNT(DISTINCT la.fkArtista) AS qtdLineups,
            COUNT(DISTINCT s.idSpotify) AS qtdDadosSpotifys,
            COUNT(DISTINCT ls.idPlays) AS qtdDadosLastFm
        FROM Artista AS a
        LEFT JOIN Artista AS r 
            ON r.fkRelacionadoA = a.idArtista
            AND r.idArtista != r.fkRelacionadoA
        LEFT JOIN LineupArtista AS la 
            ON la.fkArtista = a.idArtista
        LEFT JOIN Spotify AS s 
            ON s.fkArtista = a.idArtista
        LEFT JOIN LastFm AS ls 
            ON ls.fkArtista = a.idArtista
        GROUP BY a.idArtista;
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function editar(infos = {}) {
    const instrucaoSql = `
        UPDATE Artista SET
            nome = '${infos.nome}',
            fkRelacionaodoA = ${infos.idRelacionado}
        WHERE idArtista = ${infos.id};
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletar(idArtista = 0) {
    const instrucaoSql = `DELETE FROM Artista WHERE idArtista = ${idArtista};`

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    criar,
    buscarPorNome,
    listarQtdDados,
    editar,
    listarPais,
    deletar
};