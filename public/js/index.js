if (!sessionStorage.ID_USUARIO) {
    document.querySelector("#btn-login").innerHTML = "Entrar";
}

function acaoPerfil(target) {
    if (target.innerText.toLowerCase() == "entrar") {
        target.addEventListener("click", e => {
            window.location = "./login.html" 
        })
    } else {
        target.addEventListener("click", e => {
            sessionStorage.clear();
            location.reload();
        })
    }
}