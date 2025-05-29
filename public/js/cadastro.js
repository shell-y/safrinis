import * as f from "./formatar_campos.js"
import * as validar from "./validar_campos.js"

  function cadastrar() {
    const campos = {
      cnpj: document.getElementById("cnpj").value,
      nome: document.getElementById("nome").value,
      celular: document.getElementById("celular").value,
      email: document.getElementById("email").value,
      senha: document.getElementById("senha").value,
      confirmarSenha: document.getElementById("confirmarSenha").value
    }

    if (
      !validar.camposPreenchidos(campos) ||
      !validar.senhaValida(campos.senha, campos.confirmarSenha) ||
      !validar.emailValido(campos.email)
    ) {
      return false
    }

    campos.cnpj = f.formatarParaEnvio(campos.cnpj)
    campos.celular = f.formatarParaEnvio(campos.celular)

    fetch("/usuarios/cadastrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cnpjServer: campos.cnpj,
        nomeServer: campos.nome,
        celularServer: campos.celular,
        emailServer: campos.email,
        senhaServer: campos.senha
      }),
    })
      .then(function (resposta) {
        console.log("resposta: ", resposta)

        if (resposta.ok) {
          alert("Cadastro realizado com sucesso! Redirecionando para tela de Login...")
          setTimeout(() => {
            window.location = "login.html"
          }, 500)
        } else {
          throw "Houve um erro ao tentar realizar o cadastro!"
        }
      })
      .catch(function (resposta) {
        console.log(`#ERRO: ${resposta}`)
      })
  }

  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault()
    cadastrar()
  })