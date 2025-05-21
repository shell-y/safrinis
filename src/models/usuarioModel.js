const database = require("../database/config")
// const bcrypt = require("bcrypt");

function autenticar(email, senha) {
    const instrucaoSql = `
        SELECT * FROM Usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: " + instrucaoSql);

    return database.executar(instrucaoSql)

            // return bcrypt.compare(senha, usuario.senha).then(match => {
            //     if (match) {
            //         return [{
            //             id: usuario.idUsuario,
            //             nome: usuario.nome,
            //             email: usuario.email,
            //             empresa: usuario.empresa
            //         }];
            //     } else {
            //         return [];
            //     }
            // });
}

function cadastrar(empresa, cnpj, nome, celular, email, senha) {
    const instrucaoSql = `
    INSERT INTO Usuario (empresa, cnpj, nome, celular, email, senha)
    VALUES ('${empresa}', '${cnpj}', '${nome}', '${celular}', '${email}', '${senha}');
    `;
    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
    
    //const saltRounds = 5;
    // return bcrypt.hash(senha, saltRounds).then(hash => {
    // });
}


function verificarExistente(cnpj) {
    var instrucaoSql = `
        SELECT * FROM Usuario WHERE cnpj = '${cnpj}';
    `;
    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    autenticar,
    cadastrar,
    verificarExistente
};