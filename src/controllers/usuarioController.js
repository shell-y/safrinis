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
                        nome: resultadoAutenticar[0].nome,
                        // usuario: resultadoAutenticar[0].usuario,
                        empresa: resultadoAutenticar[0].empresa
                    });
                    /*
                    if (resultadoAutenticar.length == 1) {
                        console.log(resultadoAutenticar);

                        lineupModel.buscarLineupPorUsuario(resultadoAutenticar[0].id)
                            .then((resultadoLineup) => {
                                if(resultadoLineup.length > 0){
                                    res.json({
                                        id: resultadoAutenticar[0].id,
                                        email: resultadoAutenticar[0].email,
                                        nome: resultadoAutenticar[0].nome,
                                        // usuario: resultadoAutenticar[0].usuario,
                                        empresa: resultadoAutenticar[0].empresa,
                                        lineup: resultadoLineup
                                    });
                                } else {
                                    res.status(204).json({ lineup: [] });
                                }
                            })
                        

                    } else if (resultadoAutenticar.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }*/
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
        empresa: req.body.empresaServer,
        cnpj: req.body.cnpjServer,
        nome: req.body.nomeServer,
        celular: req.body.celularServer,
        // usuario: req.body.usuarioServer,
        email: req.body.emailServer,
        senha: req.body.senhaServer
    };

    for (let campo in campos) {
        if (!campos[campo]) {
            res.status(400).send(`${campo} está undefined`);
            return;
        }
    }

    usuarioModel.verificarExistente(campos.cnpj)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(409).send("E-mail ou usuário já cadastrado");
            } else {
                usuarioModel.cadastrar(
                    campos.empresa,
                    campos.cnpj,
                    campos.nome,
                    campos.celular,
                    // campos.usuario,
                    campos.email,
                    campos.senha
                )
                    .then(resultado => res.json(resultado))
                    .catch(erro => {
                        console.error("Erro ao cadastrar:", erro.sqlMessage);
                        res.status(500).json(erro.sqlMessage);
                    });
            }
        })
        .catch((erro) => {
            console.error("Erro ao verificar se o usuário existe:", erro);
            res.status(500).json(erro);
        });
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
        .then(resposta => {
            res.status(200).send();
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
    editar
}