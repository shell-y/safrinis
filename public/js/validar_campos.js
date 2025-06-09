    function camposValidos(campos = {}) {
      if(
        !camposPreenchidos(campos)
        || !senhaValida(campos.senha, campos.confirmarSenha)
        || !emailValido(campos.email)
        || !celularValido(campos.celular)
      ) { return false }

      return true
    }
    
    function camposPreenchidos(campos = {}) {
    for (let campo in campos) {
      if (!campos[campo]) {
        alert("Preencha todos os campos.")
        return false
      }
    }
    return true
  }

  function senhaValida(senha = "", confirmarSenha = "") {
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

  function emailValido(email = "") {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) {
      alert("E-mail inválido.")
      return false
    }
    return true
  }

  function celularValido(celular = "") {
    if (celular.length != 15) {
      alert("Número de celular inválido.");
      return false; 
    }
    return true;
  }

  export {
    camposValidos,
    camposPreenchidos,
    senhaValida,
    emailValido,
    celularValido
  }