import * as f from "./formatar_campos.js";
import * as v from "./validar_campos.js"


const inputsPerfil = document.querySelectorAll("form input");
var infosCliente = []

if (sessionStorage.ID_USUARIO == undefined) {
    alert("Usuário não autenticado. Redirecionando para a página de login.");
    location = "../login.html";
} else {
    fetch(`/usuarios/perfil/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(resposta => {
        if (resposta.ok) {
            resposta.json().then(json => {
                infosCliente = [
                    sessionStorage.NOME_USUARIO, json.senha,
                    sessionStorage.EMAIL_USUARIO, json.celular,
                    json.nomeEmpresa, json.cnpjEmpresa
                ];
        
                inserirValoresPerfil();
            });
            
        } else {
            alert("Não foi possível obter as informações do seu perfil. Recarregando a página...")
            location.reload();
        }
    });
}

function inserirValoresPerfil() {
    for (let i = 0; i < infosCliente.length; i++) {
        inputsPerfil[i].value = infosCliente[i];
        inputsPerfil[i].setAttribute("disabled", "");
    }

    cnpj.value = f.formatCNPJ(cnpj.value);
    celular.value = f.formatCelular(celular.value);
}

document.querySelector("h1 span").addEventListener("click", e => {
    e.target.style.display = "none"
    document.querySelector("#btn_deletar").style.display = "none";
    document.querySelector("form>div").style.display = "flex"

    for (let i = 0; i <= 3; i++) {
        inputsPerfil[i].removeAttribute("disabled");
    }
});

document.querySelector("#btn_cancelar_form").addEventListener("click", e => {
    e.preventDefault();

    document.querySelector("form>div").style.display = "none"
    inserirValoresPerfil();

    document.querySelector("h1 span").style.display = "inline"
    document.querySelector("#btn_deletar").style.display = "block";
})

document.querySelector("#btn_salvar_form").addEventListener("click", e => {
    e.preventDefault();

    const novoCadastro = {
        nomeUsuario: inputsPerfil[0].value,
        senha: inputsPerfil[1].value,
        confirmarSenha: inputsPerfil[1].value,
        email: inputsPerfil[2].value,
        celular: inputsPerfil[3].value
    }

    if(!v.camposValidos(novoCadastro)
    ) { return false; }

    novoCadastro.celular = f.formatarParaEnvio(novoCadastro.celular)

    fetch(`/usuarios/editar/${sessionStorage.ID_USUARIO}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(novoCadastro)
    }).then(resposta => {
        if (!resposta.ok) {
            alert("A edição do cadastro não teve sucesso...");
        } else {
            resposta.json().then(json => {
                alert("Edição bem-sucedida! Recarregando a página...")
                
                sessionStorage.EMAIL_USUARIO = json.email;
                sessionStorage.NOME_USUARIO = json.nome;
    
                location.reload();
            });
        }
    });

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

document.querySelector("#btn_deletar").addEventListener("click", e => {
    const modal = document.createElement("section");
    modal.setAttribute("id", "modal");
    modal.innerHTML = `
        <h1>Deletar conta</h1>
        <p>Deseja realmente deletar seu usuário? Essa ação não poderá ser desfeita.</p>
        <div>
          <button id="btn_confirmar_deletar">Sim</button>
          <button id="btn_cancelar_deletar">Não</button>
        </div>
    `

    document.querySelector("main").appendChild(modal)

    document.querySelector("#btn_cancelar_deletar").addEventListener("click", e => {
        modal.remove();
    });

    document.querySelector("#btn_confirmar_deletar").addEventListener("click", e => {
        fetch(`/usuarios/deletar/${sessionStorage.ID_USUARIO}`, {
            method: 'DELETE'
        }).then(resposta => {
            if (resposta.ok) {
                alert("Usuário deletado com sucesso. Redirecionando para a página inicial...");
                sessionStorage.clear();
                location = "../index.html"
            } else {
                alert("Houve um erro ao deletar o usuário.");
                console.log(resposta)
            }
        });
    });
});
