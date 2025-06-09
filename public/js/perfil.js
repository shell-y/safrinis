import * as f from "./formatar_campos.js";
import * as v from "./validar_campos.js"

document.querySelector("#btn-login").addEventListener("click", e =>{
    sessionStorage.clear();
    location = "../index.html"
});

const inputsPerfil = document.querySelectorAll("form input");

if (sessionStorage.ID_USUARIO == undefined) {
    alert("Usuário não autenticado. Redirecionando para a página de login.");
    location = "../login.html";
} else {
    fetch(`/usuarios/perfil/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(resposta => {
        if (resposta.ok) {
            resposta.json().then(json => {
                const infosCliente = [
                    sessionStorage.NOME_USUARIO, json.senha,
                    sessionStorage.EMAIL_USUARIO, json.celular,
                    json.nomeEmpresa, json.cnpjEmpresa
                ];
        
                inserirValoresPerfil(infosCliente);
            });
            
        } else {
            alert("Não foi possível obter as informações do seu perfil. Recarregando a página...")
            location.reload();
        }
    });
}

function inserirValoresPerfil(infosCliente) {
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
    document.querySelector("#div_acoes_editar").style.display = "flex"

    for (let i = 0; i <= 3; i++) {
        inputsPerfil[i].removeAttribute("disabled");
    }

    document.querySelector("svg>path").setAttribute("fill", "#000000");
});

document.querySelector("#btn_cancelar_form").addEventListener("click", e => {
    e.preventDefault();

    document.querySelector("form>div").style.display = "none"
    inserirValoresPerfil();
    document.querySelector("svg>path").setAttribute("fill", "#FFFFFF");

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
    const iconeSenha = document.querySelector("svg>path");

    if (inputSenha.getAttribute("type") == "password") {
        iconeSenha.setAttribute("d", "M2.54,4.71L3.25,4L20,20.75L19.29,21.46L15.95,18.11C14.58,18.68 13.08,19 11.5,19C6.94,19 3,16.35 1.14,12.5C2.11,10.5 3.63,8.83 5.5,7.68L2.54,4.71M11.5,18C12.79,18 14.03,17.77 15.17,17.34L14.05,16.21C13.32,16.71 12.45,17 11.5,17C9,17 7,15 7,12.5C7,11.55 7.29,10.68 7.79,9.95L6.24,8.41C4.57,9.38 3.19,10.8 2.26,12.5C4.04,15.78 7.5,18 11.5,18M20.74,12.5C18.96,9.22 15.5,7 11.5,7C10.35,7 9.23,7.19 8.19,7.53L7.41,6.75C8.68,6.26 10.06,6 11.5,6C16.06,6 20,8.65 21.86,12.5C20.95,14.39 19.53,16 17.79,17.13L17.07,16.4C18.6,15.44 19.87,14.1 20.74,12.5M11.5,8C14,8 16,10 16,12.5C16,13.32 15.78,14.08 15.4,14.74L14.66,14C14.88,13.54 15,13.04 15,12.5A3.5,3.5 0 0,0 11.5,9C10.96,9 10.46,9.12 10,9.34L9.26,8.6C9.92,8.22 10.68,8 11.5,8M8,12.5A3.5,3.5 0 0,0 11.5,16C12.17,16 12.79,15.81 13.32,15.5L8.5,10.68C8.19,11.21 8,11.83 8,12.5Z");
        inputSenha.setAttribute("type", "text");
    } else {
        iconeSenha.setAttribute("d", "M11.5,18C15.5,18 18.96,15.78 20.74,12.5C18.96,9.22 15.5,7 11.5,7C7.5,7 4.04,9.22 2.26,12.5C4.04,15.78 7.5,18 11.5,18M11.5,6C16.06,6 20,8.65 21.86,12.5C20,16.35 16.06,19 11.5,19C6.94,19 3,16.35 1.14,12.5C3,8.65 6.94,6 11.5,6M11.5,8C14,8 16,10 16,12.5C16,15 14,17 11.5,17C9,17 7,15 7,12.5C7,10 9,8 11.5,8M11.5,9A3.5,3.5 0 0,0 8,12.5A3.5,3.5 0 0,0 11.5,16A3.5,3.5 0 0,0 15,12.5A3.5,3.5 0 0,0 11.5,9Z");
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

document.querySelector("#btn_telegram").addEventListener("click", e => {
    const confirmacao = confirm("Deseja se conectar no Telegram e receber insights semanais para seus artistas?\n"
        + "Seu número de celular (" + inputsPerfil[3].value + ") será utilizado para o conectarmos ao nosso bot e ao novo grupo."
    )

    if (!confirmacao) return

    alert("Ajustando bot e grupo...")
    document.querySelector("#btn_telegram span").innerText = "Notificações ativadas"
    document.querySelector("#btn_telegram img").setAttribute("src", "../assets/icon/check.svg");
    document.querySelector("#btn_telegram").setAttribute("disabled", "")
    document.querySelector("#btn_telegram").removeEventListener("click", e);

    const modal = document.createElement("div");

    modal.setAttribute("id", "modal");
    modal.innerHTML = `
        <h1>Telegram</h1>
        <p>
            <strong>Bot e grupo configurado com sucesso!</strong>
        </p>
        <p>
            Clique no link abaixo para entrar no grupo e acompanhar seus artistas!
        </p>

        <p><a href="https://t.me/+To0VbcE0Qi84YTgx" target="blank">Grupo do Telegram | Sonora - Notificações</a></p>
        
        <div>
          <button id="btn_modal">Fechar</button>
        </div>
    `

    document.querySelector("main").appendChild(modal)

    document.querySelector("#btn_modal").addEventListener("click", e => {
        modal.remove();
    });
})