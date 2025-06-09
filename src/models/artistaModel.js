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
        SELECT * FROM Artista WHERE idArtista = fkRelacionadoA;
    `

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarQtdDados() {
  const instrucaoSql = `
      SELECT
          a.idArtista as id,
          a.nome,
          COUNT(la.fkArtista) AS qtdLineups,
          COUNT(DISTINCT s.idSpotify) AS qtdDadosSpotify,
          COUNT(DISTINCT ls.idPlays) AS qtdDadosLastFm
      FROM Artista AS a
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

function listarNomesRelacionados() {
  const instrucaoSql = `
    SELECT
      r.idArtista as idRelacionado,
      r.nome as nomeRelacionado,
      a.idArtista as id,
      a.nome
    FROM Artista as a
    JOIN Artista as r
      ON r.fkRelacionadoA = a.idArtista;
  `

  console.log("Executando a instrução SQL: " + instrucaoSql);
  return database.executar(instrucaoSql);
}

function editar(infos = {}) {
    const instrucaoSql = `
        UPDATE Artista SET
            nome = '${infos.nome}',
            fkRelacionadoA = ${infos.idRelacionado}
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

//routes > controller > MODEL > database



function buscarPorNome(nome) {
    const instrucaoSql = `
        SELECT * FROM Artista WHERE nome = '${nome}';
        `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarRelacionados(artistaId) {
    const instrucaoSql = `
        SELECT DISTINCT 
          relacionados.idArtista, 
          relacionados.nome, 
          relacionados.fkRelacionadoA
        FROM Artista selecionado
        JOIN Artista relacionados ON selecionado.fkRelacionadoA = relacionados.fkRelacionadoA
        WHERE selecionado.idArtista IN (${artistaId})
        AND relacionados.idArtista NOT IN (${artistaId})
        ORDER BY RAND()
        LIMIT 10;
        `

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarNomesArtistas() {
    var instrucaoSql = `SELECT * FROM Artista;`

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarDetalhesDoArtista(idArtista) {
    const instrucaoSql = `
        SELECT 
            a.nome,
            s.popularidade,
            l.ouvintes,
            l.onTour,
            l.plays
        FROM Artista a
        LEFT JOIN Spotify s ON s.fkArtista = a.idArtista
        LEFT JOIN LastFm l ON l.fkArtista = a.idArtista
        WHERE a.idArtista = ${idArtista}
        LIMIT 1;
    `;
    return database.executar(instrucaoSql);
}

function listarRelacionados(ids) {
    const instrucaoSql = `
    SELECT DISTINCT relacionados.idArtista, relacionados.nome, l.ouvintes
    FROM Artista selecionado
    JOIN Artista relacionados ON selecionado.fkRelacionadoA = relacionados.fkRelacionadoA
    LEFT JOIN LastFm l ON l.fkArtista = relacionados.idArtista
    WHERE selecionado.idArtista IN (${ids})
      AND relacionados.idArtista NOT IN (${ids}) -- não incluir quem já está na line-up
    ORDER BY RAND()
    LIMIT 4;
  `;
    return database.executar(instrucaoSql);
}

async function salvarLineup(nomeLineup, idUsuario, artistas, idLineup, onTour) {
  if (idLineup) {
    // Line-up já existe → atualiza o nome e limpa artistas antigos
    await database.executar(`
      UPDATE Lineup SET nomeLineup = '${nomeLineup}' WHERE idLineup = ${idLineup};
    `);

        await database.executar(`
      DELETE FROM LineupArtista WHERE fkLineup = ${idLineup};
    `);
    } else {
        // Nova line-up
        await database.executar(`
      INSERT INTO Lineup (fkUsuario, nomeLineup)
      VALUES (${idUsuario}, '${nomeLineup}');
    `);

        const resultado = await database.executar(`
      SELECT idLineup FROM Lineup WHERE fkUsuario = ${idUsuario} AND nomeLineup = '${nomeLineup}' LIMIT 1;
    `);
        idLineup = resultado[0].idLineup;
    }

  // Insere artistas atualizados
  for (const nome of artistas) {
  await database.executar(`
    INSERT INTO LineupArtista (fkLineup, fkArtista)
    SELECT ${idLineup}, idArtista
    FROM Artista
    WHERE nome = '${nome}';
  `);
}

    return;
}

function renomearLineup(idLineup, novoNome) {
    const sql = `
    UPDATE Lineup
    SET nomeLineup = '${novoNome}'
    WHERE idLineup = ${idLineup};
  `;
    return database.executar(sql);
}

function listarLineups(idUsuario) {
    const sql = `
    SELECT idLineup, nomeLineup
    FROM Lineup
    WHERE fkUsuario = ${idUsuario};
  `;
    return database.executar(sql);
}

function buscarLineupPorId(idLineup) {
    const sql = `
    SELECT 
        a.idArtista,
        a.nome,
        s.popularidade,
        lf.ouvintes,
        lf.plays,
        lf.ontour,
        lu.nomeLineup
    FROM LineupArtista la
    JOIN Artista a ON la.fkArtista = a.idArtista
    LEFT JOIN Spotify s ON s.fkArtista = a.idArtista
    LEFT JOIN (
        SELECT l1.*
        FROM LastFm l1
        INNER JOIN (
            SELECT fkArtista, MAX(dataColeta) AS ultimaData
            FROM LastFm
            GROUP BY fkArtista
        ) l2 ON l1.fkArtista = l2.fkArtista AND l1.dataColeta = l2.ultimaData
    ) lf ON lf.fkArtista = a.idArtista
    JOIN Lineup lu ON lu.idLineup = la.fkLineup
    WHERE la.fkLineup = ${idLineup};
  `;
    return database.executar(sql);
}

function excluirLineup(idLineup) {
    const sql = `
    DELETE FROM Lineup WHERE idLineup = ${idLineup};
  `;
    return database.executar(sql);
}


module.exports = {
  criar,
  buscarPorNome,
  listarQtdDados,
  listarNomesRelacionados,
  editar,
  listarPais,
  deletar,

  listarNomesArtistas,
  buscarDetalhesDoArtista,
  listarRelacionados,
  salvarLineup,
  renomearLineup,
  listarLineups,
  buscarLineupPorId,
  excluirLineup,
  buscarRelacionados
};
