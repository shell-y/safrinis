document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault()
    entrar()
})

function entrar() {
    let email = document.getElementById("email").value
    let senha = document.getElementById("senha").value

    if (email == "" || senha == "") {
        alert("Campos em branco")
        return false
    }

    fetch("/usuarios/autenticar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailServer: email,
            senhaServer: senha
        })
    }).then(function (resposta) {
        console.log("ESTOU NO THEN DO entrar()!")

        if (resposta.ok) {
            console.log(resposta);

            resposta.json().then(json => {
                console.log(json);
                console.log(JSON.stringify(json));
                sessionStorage.ID_USUARIO = json.id;
                sessionStorage.EMAIL_USUARIO = json.email;
                sessionStorage.NOME_USUARIO = json.nome;
                sessionStorage.EMPRESA = json.fkEmpresa;

                setTimeout(function () {
                    window.location = "./dashboard/cards.html";
                }, 1000);

            });

        } else {
            console.log("Houve um erro ao tentar realizar o login!");
        }

    }).catch(function (erro) {
        console.log(erro);
    })


}