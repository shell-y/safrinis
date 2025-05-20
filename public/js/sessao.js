// // sessão
// function validarSessao() {
//     var email = sessionStorage.EMAIL_USUARIO;
//     var nome = sessionStorage.NOME_USUARIO;

//     if (email == null && nome == null) {
//         window.location = "../login.html";
//     }
// }

function limparSessao() {
    sessionStorage.clear();
    window.location = "../index.html";
}

// function finalizarAguardar(texto) {
//     var divAguardar = document.getElementById("div_aguardar");
//     divAguardar.style.display = "none";
// }

// function limparLineup(){
//     sessionStorage.LINEUPSELECIONADA = null
// }

