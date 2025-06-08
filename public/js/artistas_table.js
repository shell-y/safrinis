const idsLineup = new Set(); // armazena os ids dos artistas adicionados
const mapaNomeParaId = new Map(); // chave: nome, valor: id


function obterIdPorNome(nome) {
    return mapaNomeParaId.has(nome) ? mapaNomeParaId.get(nome) : null;
}

function formatarNumeroAbreviado(numero) {
    const n = Number(numero);

    if (isNaN(n)) return "N/A";

    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "k";
    return n.toString();
}


function adicionarArtista(valueArtista) {
    //Deselecionar o artista no select
    $('#select_artistas').val(null).trigger('change');

    const tabela = document.getElementById('tabela_artistas');

    if (!valueArtista) {
        alert("Selecione um artista");
        return;
    }

    fetch(`/artista/detalhes/${valueArtista}`)
        .then(res => res.json())
        .then(dados => {
            const linhaVazia = document.getElementById('linha-vazia');
            if (linhaVazia) linhaVazia.remove();

            const jaExiste = Array.from(tabela.rows).some(row => row.cells[0]?.innerText === dados.nome);
            if (jaExiste) {
                alert("Esse artista já está na sua line-up!");
                return;
            }

            const hoje = new Date().toLocaleDateString('pt-BR');

            tabela.innerHTML += `
                <tr>
                    <th scope="row">${dados.nome}</th>
                    <td>${dados.popularidade + "%" ?? 'N/A'}</td>
                    <td>${formatarNumeroAbreviado(dados.ouvintes) ?? 'N/A'}</td>
                    <td>${formatarNumeroAbreviado(dados.plays) ?? 'N/A'}</td>
                    <td>${hoje}</td>
                    <td><a href="#" onclick="excluirLinha(this)">Excluir</a></td>
                </tr>
            `;

            // Carrega os artistas relacionados
            carregarRelacionados(valueArtista, dados.nome);

            // Habilita botão
            lineupModificada = true;
            atualizarEstadoBotaoSalvar();

        })
        .catch(err => {
            console.error('Erro ao buscar dados do artista:', err);
            alert("Erro ao carregar os dados do artista.");
        });
}



function excluirLinha(link) {
    const linha = link.closest('tr');
    const tabela = document.getElementById('tabela_artistas');

    if (!linha) return;

    const nomeArtista = linha.cells[0].innerText.trim();

    // Remove a linha da tabela
    linha.remove();

    // ✅ Habilita/desabilita o botão de salvar após exclusão
    lineupModificada = true;
    atualizarEstadoBotaoSalvar();

    // Remove o artista do Set (baseado no ID, se tiver)
    // Aqui é onde precisamos de um mapa entre nome e ID
    const idASerRemovido = obterIdPorNome(nomeArtista); // vamos criar essa função

    if (idASerRemovido !== null) {
        idsLineup.delete(idASerRemovido);
    }

    // Se não houver mais artistas, mostra a linha de aviso
    if (tabela.rows.length === 0) {
        tabela.innerHTML = `
      <tr id="linha-vazia">
        <td colspan="6" style="text-align: center; color: #888;">Selecione algum artista para começar</td>
      </tr>
    `;
    }
}


function carregarRelacionados(idArtista, nomePrincipal) {
    const tabelaRelacionados = document.getElementById('tabela_relacionados');
    const tabelaLineup = document.getElementById('tabela_artistas');

    fetch(`/artista/relacionados/${idArtista}`)
        .then(res => res.json())
        .then(lista => {
            // Filtra os que já estão na line-up
            const nomesNaTabela = Array.from(tabelaLineup.rows).map(row => row.cells[0]?.innerText?.trim());
            const relacionadosFiltrados = lista.filter(artista => !nomesNaTabela.includes(artista.nome));

            // Se nenhum restou, mostra aviso
            if (relacionadosFiltrados.length === 0) {
                tabelaRelacionados.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: #888;">
              Nenhum artista relacionado disponível (alguns já estão na sua line-up)
            </td>
          </tr>
          `;
                return;
            }

            // Preenche a tabela com os relacionados filtrados
            tabelaRelacionados.innerHTML = "";
            relacionadosFiltrados.forEach(artista => {
                tabelaRelacionados.innerHTML += `
          <tr>
            <th scope="row">${artista.nome}</th>
            <td>${formatarNumeroAbreviado(artista.ouvintes) ?? 'N/A'}</td>
            <td>${nomePrincipal}</td>
            <td><a href="#" onclick="adicionarArtista(${artista.idArtista})">Adicionar à line-up</a></td>
            <td><a href="#" onclick="this.closest('tr').remove()">Pular</a></td>
          </tr>
        `;
            });
        })
        .catch(erro => {
            console.error("Erro ao carregar relacionados:", erro);
        });
}

function adicionarRelacionado(nome, popularidade, ouvintes, plays) {
    const tabela = document.getElementById('tabela_artistas');
    const jaExiste = Array.from(tabela.rows).some(row => row.cells[0]?.innerText === nome);
    if (jaExiste) {
        alert("Esse artista já está na line-up!");
        return;
    }

    // Remove a linha "vazia", se existir
    const linhaVazia = document.getElementById('linha-vazia');
    if (linhaVazia) linhaVazia.remove();

    const hoje = new Date().toLocaleDateString('pt-BR');

    tabela.innerHTML += `
    <tr>
          <th scope="row">${nome}</th>
          <td>${popularidade + "%" ?? 'N/A'}</td>
          <td>${formatarNumeroAbreviado(ouvintes) ?? 'N/A'}</td>
          <td>${formatarNumeroAbreviado(plays) ?? 'N/A'}</td>
          <td>${hoje}</td>
          <td><a href="#" onclick="excluirLinha(this)">Excluir</a></td>
        </tr>
  `;
    atualizarEstadoBotaoSalvar();
}

function limparLineup() {
    const tabela = document.getElementById('tabela_artistas');
    const tabelaRelacionados = document.getElementById('tabela_relacionados');

    tabela.innerHTML = `
        <tr id="linha-vazia">
        <td colspan="6" style="text-align: center; color: #888;">Selecione algum artista para começar</td>
        </tr>`;
    tabelaRelacionados.innerHTML = `
        <tr id="linha-vazia">
        <td colspan="6" style="text-align: center; color: #888;">Selecione um artista para ver recomendações</td>
        </tr>`;

    atualizarEstadoBotaoSalvar();
}
