function formatCNPJ(value) {
    value = value.replace(/\D/g, "")
    value = value.replace(/(\d{2})(\d)/, "$1.$2")
    value = value.replace(/(\d{3})(\d)/, "$1.$2")
    value = value.replace(/(\d{3})(\d)/, "$1/$2")
    value = value.replace(/(\d{4})(\d)/, "$1-$2")
    return value
  }

  document.getElementById("cnpj").addEventListener("input", function (e) {
    e.target.value = formatCNPJ(e.target.value)
  })

  function formatCelular(value) {
    value = value.replace(/\D/g, "")
    value = value.replace(/^(\d{2})(\d)/, "($1) $2")
    value = value.replace(/(\d{5})(\d)/, "$1-$2")
    return value
  }

  document.getElementById("celular").addEventListener("input", function (e) {
    e.target.value = formatCelular(e.target.value)
  })

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
      empresa: document.getElementById("empresa").value,
      cnpj: document.getElementById("cnpj").value,
      nome: document.getElementById("nome").value,
      celular: document.getElementById("celular").value,
      // usuario: document.getElementById("usuario").value,
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

    campos.cnpj = formatarParaEnvio(campos.cnpj)
    campos.celular = formatarParaEnvio(campos.celular)

    fetch("/usuarios/cadastrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        empresaServer: campos.empresa,
        cnpjServer: campos.cnpj,
        nomeServer: campos.nome,
        celularServer: campos.celular,
        // usuarioServer: campos.usuario,
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

  function formatarParaEnvio(str) {
    var novaStr = "";
    const caracteresIndesejados = "./-() "

    for (let char of str) {
        if (!caracteresIndesejados.includes(char)) {
            novaStr += char;
        }
    }

    return novaStr;
  }