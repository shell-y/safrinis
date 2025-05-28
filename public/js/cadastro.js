import * as format from "./formatar_campos.js"

  function validarCamposVazios(campos) {
    for (let campo in campos) {
      if (!campos[campo]) {
        alert("Preencha todos os campos.")
        return false
      }
    }
    return true
  }

  function validarSenha(senha, confirmarSenha) {
    if (senha.length < 8) {
      alert("A senha precisa ter pelo menos 8 caracteres.")
      return false
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.")
      return false
    }

    const caracteresEspeciais = `!@#$%¨&*()_-=+*/[]{}|\\;:.,`
    let temNumero = false
    let temEspecial = false

    for (let char of senha) {
      if (!isNaN(char)) temNumero = true
      if (caracteresEspeciais.includes(char)) temEspecial = true

      if (temNumero && temEspecial) break
    }

    if (!temNumero || !temEspecial) {
      alert("A senha precisa conter pelo menos 1 número e 1 caractere especial (!@#$%...).")
      return false
    }

    return true
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) {
      alert("E-mail inválido.")
      return false
    }
    return true
  }

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
      !validarCamposVazios(campos) ||
      !validarSenha(campos.senha, campos.confirmarSenha) ||
      !validarEmail(campos.email)
    ) {
      return false
    }

    campos.cnpj = format.formatarParaEnvio(campos.cnpj)
    campos.celular = format.formatarParaEnvio(campos.celular)

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