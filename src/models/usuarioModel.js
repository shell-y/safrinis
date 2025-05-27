const database = require("../database/config")

function autenticar(email, senha) {
    const instrucaoSql = `
        SELECT * FROM Usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: " + instrucaoSql);

    return database.executar(instrucaoSql)
}

function cadastrar(fkempresa, nome, celular, email, senha) {
    const instrucaoSql = `
    INSERT INTO Usuario (fkEmpresa, nomeUsuario, celular, email, senha)
    VALUES (${fkempresa}, '${nome}', '${celular}', '${email}', '${senha}');
    `;
    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function verificarUsuarioExiste(email){
    const instrucaoSql = `
    SELECT * FROM usuario WHERE email = '${email}';
    `
    console.log("Executando a instruçaõ SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}


function verificarEmpresaExiste(cnpj) {
    const instrucaoSql = `
        SELECT * FROM empresa WHERE cnpj = '${cnpj}';
    `;
    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    autenticar,
    cadastrar,
    verificarUsuarioExiste,
    verificarEmpresaExiste
};