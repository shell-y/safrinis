var usuarioModel = require("../models/usuarioModel");
var lineupModel = require("../models/lineupModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {

        usuarioModel.autenticar(email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`); // transforma JSON em String

                    res.json({
                        id: resultadoAutenticar[0].idUsuario,
                        email: resultadoAutenticar[0].email,
                        nome: resultadoAutenticar[0].nomeUsuario,
                        empresa: resultadoAutenticar[0].fkEmpresa
                    });
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}

function cadastrar(req, res) {
    const campos = {
        cnpj: req.body.cnpjServer,
        nome: req.body.nomeServer,
        celular: req.body.celularServer,
        email: req.body.emailServer,
        senha: req.body.senhaServer
    };

    for (let campo in campos) {
        if (!campos[campo]) {
            res.status(400).send(`${campo} está undefined`);
            return;
        }
    }

    usuarioModel.verificarUsuarioExiste(campos.email)
        .then((resultado) => {
            if (resultado.length > 0) {
                return res.status(409).json({ erro: "E-mail já cadastrado" });
            }

            return usuarioModel.verificarEmpresaExiste(campos.cnpj);
        })
        .then((empresa) => {
            if (!empresa || empresa.length === 0) {
                return res.status(404).json({ erro: "Empresa não cadastrada" });
            }

            return usuarioModel.cadastrar(
                empresa[0].idEmpresa,
                campos.nome,
                campos.celular,
                campos.email,
                campos.senha
            );
        })
        .then(() => {
            res.status(201).json({ mensagem: "Usuário cadastrado com sucesso" });
        })
        .catch((erro) => {
            console.error("Erro no cadastro:", erro);
            res.status(500).json({ erro: "Erro interno no servidor" });
        });
}

function coletarPerfil(req, res) {
    const idUsuario = req.params.idUsuario;

    console.log(`O usuário de id ${idUsuario} requeriu suas informações...`)

    usuarioModel.perfil(idUsuario)
    .then(resposta => {
        if(resposta.length == 0) {
            res.status(404).send()
        } else {
            res.json({
                senha: resposta[0].senha,
                celular: resposta[0].celular,
                nomeEmpresa: resposta[0].nomeEmpresa, 
                cnpjEmpresa: resposta[0].cnpjEmpresa
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).send();
    }) 
}

function editar(req, res) {
    const cadastroUsuario = {
        id: req.params.idUsuario,
        nome: req.body.nomeUsuario,
        senha: req.body.senha,
        email: req.body.email,
        celular: req.body.celular
    };

    console.log(`Executando edição de cadastro para o usuário id ${cadastroUsuario.id}, ${cadastroUsuario.nome}...\n`);

    usuarioModel
        .editar(cadastroUsuario)
        .then(resultado => {
            if (resultado.serverStatus == 2) {
                usuarioModel
                .autenticar(cadastroUsuario.email, cadastroUsuario.senha)
                .then(resultado => {
                    res.json({
                        email: resultado[0].email,
                        nome: resultado[0].nomeUsuario
                    });
                })
            }
        })
        .catch(erro => {
            console.log("Ocorreu um erro!");
            console.log(erro);
            res.status(500).send();
        })
    ;
}

module.exports = {
    autenticar,
    cadastrar,
    coletarPerfil,
    editar
}