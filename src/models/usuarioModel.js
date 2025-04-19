var database = require("../database/config")

function autenticar(email, senha) {
    const instrucaoSql = `
        SELECT * FROM usuario WHERE email = '${email}';
    `;
    console.log("Executando a instrução SQL: " + instrucaoSql);

    return database.executar(instrucaoSql).then(resultado => {
        if (resultado.length === 1) {
            const usuario = resultado[0];
            return bcrypt.compare(senha, usuario.senha).then(match => {
                if (match) {
                    return [{
                        id: usuario.id,
                        nome: usuario.nome,
                        usuario: usuario.usuario,
                        email: usuario.email,
                        empresa: usuario.empresa
                    }];
                } else {
                    return [];
                }
            });
        } else {
            return [];
        }
    });
}


const bcrypt = require("bcrypt");

function cadastrar(empresa, cnpj, nome, celular, usuario, email, senha) {
    const saltRounds = 10;

    return bcrypt.hash(senha, saltRounds).then(hash => {
        const instrucaoSql = `
            INSERT INTO usuario (empresa, cnpj, nome, celular, usuario, email, senha)
            VALUES ('${empresa}', '${cnpj}', '${nome}', '${celular}', '${usuario}', '${email}', '${hash}');
        `;
        console.log("Executando a instrução SQL: " + instrucaoSql);
        return database.executar(instrucaoSql);
    });
}


function verificarExistente(email, usuario) {
    var instrucaoSql = `
        SELECT * FROM usuario WHERE email = '${email}' OR usuario = '${usuario}';
    `;
    console.log("Executando a instrução SQL: " + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    autenticar,
    cadastrar,
    verificarExistente
};