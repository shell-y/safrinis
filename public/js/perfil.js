import * as f from "./formatar_campos.js";

const inputsPerfil = document.querySelectorAll("form input");
var infosCliente = sessionStorage.NOME_USUARIO != undefined ?
    [
        "puxar valores storage"
    ]
        :
    [
        "Rodapé Festivais", "12345678900014",
        "Roberto", "@Rodape123",
        "roberto@email.com", "11912341234",
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

        inputsPerfil.forEach((input) => {
            input.removeAttribute("disabled");
        });
    } else {
        elemento.innerText = "Editar";
        inserirValoresPerfil();
    }
}

document.querySelector("form>button").addEventListener("click", e => {
    e.preventDefault();
});

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
