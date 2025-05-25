import * as f from "./formatar_campos.js";

const inputsPerfil = document.querySelectorAll("form input");
var infosCliente = sessionStorage.NOME_USUARIO != undefined ?
    [
        sessionStorage.NOME_USUARIO, sessionStorage.SENHA,
        sessionStorage.EMAIL_USUARIO, sessionStorage.CELULAR,
        sessionStorage.EMPRESA.nomeFantasia, sessionStorage.EMPRESA.cnpj
    ]
        :
    [
        "Roberto", "@Rodape123",
        "roberto@email.com", "11912341234",
        "Rodapé Festivais", "12345678000114"
    ]
;

inserirValoresPerfil();

function inserirValoresPerfil() {
    for (let i = 0; i < infosCliente.length; i++) {
        inputsPerfil[i].value = infosCliente[i];
        inputsPerfil[i].setAttribute("disabled", "");
    }

    cnpj.value = f.formatCNPJ(cnpj.value);
    celular.value = f.formatCelular(celular.value);
}

document.querySelector("h1 span").addEventListener("click", e => {
    habilitarEdicao(e.target);
});

function habilitarEdicao(elemento) {
    if (elemento.innerText == "Editar") {
        elemento.innerText = "Cancelar";

        for (let i = 0; i <= 3; i++) {    
            inputsPerfil[i].removeAttribute("disabled");
        }
        
    } else {
        elemento.innerText = "Editar";
        inserirValoresPerfil();
    }
}

document.querySelector("form>button").addEventListener("click", e => {
    e.preventDefault();
    const novoCadastro = {
        nomeUsuario: inputsPerfil[0].value,
        senha: inputsPerfil[1].value,
        email: f.formatarParaEnvio(inputsPerfil[2].value),
        celular: f.formatarParaEnvio(inputsPerfil[3].value)
    }

    fetch(`/usuarios/editar/${sessionStorage.ID_USUARIO}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(novoCadastro)
    }).then(resposta => {
        console.log(resposta)
        
        if (!resposta.ok) {
            alert("A edição do cadastro não teve sucesso...");
        } else {
            alert("Edição bem-sucedida! Recarregando a página...")
            
            sessionStorage.NOME_USUARIO = novoCadastro.nomeUsuario; 
            sessionStorage.SENHA_USUARIO = novoCadastro.senha;
            sessionStorage.EMAIL_USUARIO = novoCadastro.email;
            sessionStorage.CELULAR = novoCadastro.celular;

            location.reload();
        }
    })
});

// visibilidade do campo da senha
document.querySelector("#div_senha button").addEventListener("click", e => {
    e.preventDefault();
    const inputSenha = document.querySelector("#div_senha input");

    if (inputSenha.getAttribute("type") == "password") {
        e.target.setAttribute("src", "../assets/icon/eye_closed.svg");
        inputSenha.setAttribute("type", "text");
    } else {
        e.target.setAttribute("src", "../assets/icon/eye.svg");
        inputSenha.setAttribute("type", "password");
    }
});
