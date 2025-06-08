$(document).ready(function () {
  // Inicializa o Select2
  $('#select_artistas').select2({
    placeholder: "Selecione ou busque...",
    allowClear: true,
    width: 'resolve'
  });
});

fetch("/artista/listar", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
}).then(function (resposta) {

  if (resposta.ok) {
    console.log('Resposta req rota artista', resposta);

    resposta.json().then(json => {
      console.log(json);
      console.log(JSON.stringify(json));
      popularSelect(json);
    });

  } else {
    console.log("Houve um erro ao tentar listar os artistas");
  }

}).catch(function (erro) {
  console.log('Deu ruim na resposta', erro);
});

function popularSelect(listaArtistas) {
  for (let i = 0; i < listaArtistas.length; i++) {
    select_artistas.innerHTML += `
  <option value="${listaArtistas[i].idArtista}">${listaArtistas[i].nome}</option>
  `
  }
}
