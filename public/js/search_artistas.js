$(document).ready(function () {
  // Inicializa o Select2
  $('#artistas').select2({
    placeholder: "Selecione ou busque...",
    allowClear: true,
    width: 'resolve'
  });

  // Ação do botão para limpar o select
  /* $('#limpar-artista').on('click', function () {
  $('#artistas').val(null).trigger('change');
  });*/
});
