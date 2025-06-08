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
    INSERT INTO     Usuario (fkEmpresa, nomeUsuario, celular, email, senha)
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

function perfil(idUsuario) {
    const instrucaoSql = `
        SELECT 
            u.senha, u.celular, 
            e.nomeFantasia as nomeEmpresa, e.cnpj as cnpjEmpresa 
                from Usuario as u 
                join Empresa as e 
                    where u.fkEmpresa = e.idEmpresa
                    and u.idUsuario = ${idUsuario};
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function editar(usuario) {
    const instrucaoSql = `
        UPDATE Usuario SET
            nomeUsuario = "${usuario.nome}",
            senha = "${usuario.senha}",
            celular = "${usuario.celular}",
            email = "${usuario.email}"
                WHERE idUsuario = ${usuario.id};
    `;

    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletar(idUsuario) {
    const instrucaoSql = `
        UPDATE Usuario SET
            email = null,
            senha = null
                WHERE idUsuario = ${idUsuario};
    `;
    
    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    cadastrar,
    editar,
    verificarUsuarioExiste,
    verificarEmpresaExiste,
    perfil,
    editar,
    deletar
};