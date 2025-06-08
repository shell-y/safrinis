let idLineupAtual = null;
let lineupModificada = false;

document.addEventListener("DOMContentLoaded", () => {
    carregarSelectLineups();
    const idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario) {
        document.getElementById("btn-login").innerText = "Sair";
    }else{
        document.getElementById("btn-login").innerText = "Login";
    }
});

document.getElementById('lineups').addEventListener('change', function () {
    idLineupAtual = this.value;
    carregarLineup(idLineupAtual);
});


function alternarLoginLogout() {
  const idUsuario = sessionStorage.ID_USUARIO;

  if (idUsuario) {
    const confirmacao = confirm("Tem certeza que deseja sair?");
    if (!confirmacao) return;
    // Usuário está logado → fazer logout
    sessionStorage.clear();
    window.location.href = "../login.html"; // redireciona para a página de login
  } else {
    // Usuário não está logado → ir para login
    window.location.href = "../login.html";
  }
}

function atualizarEstadoBotaoSalvar() {
    const tabela = document.getElementById("tabela_artistas");
    const botao = document.getElementById("salvarLineup");

    const artistasNaTabela = Array.from(tabela.rows).filter(row => row.id !== "linha-vazia");

    if (artistasNaTabela.length > 0 || lineupModificada) {
        botao.disabled = false;
    } else {
        botao.disabled = true;
    }
}

function abrirLineup() {
    const select = document.getElementById("lineups");
    const idSelecionado = select.value;

    if (!idSelecionado) {
        alert("Selecione uma line-up.");
        return;
    }

    fetch(`/artista/lineup/${idSelecionado}`)
        .then(res => res.json())
        .then(artistas => {
            const tabela = document.getElementById("tabela_artistas");
            if (!artistas.length) {
                alert("Essa line-up está vazia.");
                tabela.innerHTML = `
                <tr id="linha-vazia"><td colspan="6" style="text-align: center; color: #888;">
                Selecione algum artista para começar
                </td></tr>`;
            }

            tabela.innerHTML = "";

            artistas.forEach(a => {
                            console.log('TABELA',a);

                tabela.innerHTML += `
          <tr>
            <th scope="row">${a.nome}</th>
            <td>${a.popularidade + "%" ?? 'N/A'}</td>
            <td>${formatarNumeroAbreviado(a.ouvintes) ?? 'N/A'}</td>
            <td>${formatarNumeroAbreviado(a.plays) ?? 'N/A'}</td>
            <td>${a.ontour ? 'Sim' : 'Não'}</td>
            <td><a href="#" onclick="excluirLinha(this)">Excluir</a></td>
          </tr>
        `;
            });

            // Atualiza o input e o ID atual
            document.getElementById("nome_lineup").value = artistas[0].nomeLineup;
            idLineupAtual = parseInt(idSelecionado);

            // Muda o texto do botão
            document.getElementById("salvarLineup").innerText = "Salvar alterações";
            document.getElementById("criarNova").style.display = 'block';
            document.getElementById("titulo_line").innerText = "Minhas line-ups";
        })
        .catch(erro => {
            console.error("Erro ao carregar lineup:", erro);
            alert("Erro ao carregar lineup.");
        });
}

function carregarSelectLineups() {
    const idUsuario = sessionStorage.ID_USUARIO;
    if (!idUsuario) return;

    fetch(`/artista/lineups/${idUsuario}`)
        .then(res => res.json())
        .then(lineups => {
            const select = document.getElementById("lineups");
            select.innerHTML = `<option value="" disabled selected>Selecione</option>`;

            lineups.forEach(l => {
                select.innerHTML += `<option value="${l.idLineup}">${l.nomeLineup}</option>`;
            });
        })
        .catch(err => {
            console.error("Erro ao carregar line-ups:", err);
        });
}

function habilitarInput() {
    const input = document.getElementById('nome_lineup');
    const btnRenomear = document.getElementById('btn_renomear');
    const btnCancelar = document.getElementById('btn_cancelar');
    const icon = document.getElementById('icon_renomear');

    input.disabled = false;
    input.focus(); //já coloca o cursor no input
    btnRenomear.style.display = 'block';
    btnCancelar.style.display = 'block';
    icon.style.display = 'none';
}


function cancelarRenomear() {
    const input = document.getElementById("nome_lineup");
    const btnRenomear = document.getElementById("btn_renomear");
    const btnCancelar = document.getElementById("btn_cancelar");
    const icon = document.getElementById("icon_renomear")

    input.setAttribute("disabled", true);
    btnRenomear.style.display = "none";
    btnCancelar.style.display = "none";
    icon.style.display = "block";
}

function renomearLineup() {
    const input = document.getElementById("nome_lineup");
    const btnRenomear = document.getElementById("btn_renomear");
    const btnCancelar = document.getElementById("btn_cancelar");
    const icon = document.getElementById("icon_renomear")
    const novoNome = input.value.trim();

    if (!novoNome) {
        alert("O nome da line-up não pode estar vazio.");
        return;
    }

    // if (!idLineupAtual) {
    //     alert("Crie a line-up");
    //     return;
    // }

    input.setAttribute("disabled", true);
    btnRenomear.style.display = "none";
    btnCancelar.style.display = "none";


    fetch("/artista/renomearLineup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            idLineup: idLineupAtual,
            novoNome
        })
    })
        .then(res => {
            if (res.ok) {
                alert("Line-up renomeada com sucesso!");
            } else {
                alert("Erro ao renomear line-up.");
            }
            icon.style.display = 'block';
        })
        .catch(err => {
            console.error("Erro ao renomear:", err);
        });
}

function salvarLineup() {
    const tabela = document.getElementById('tabela_artistas');
    const nomeLineup = document.getElementById('nome_lineup').value.trim();
    const idUsuario = sessionStorage.ID_USUARIO;

    if (!idUsuario) {
        alert("Usuário não está logado.");
        return;
    }

    if (idLineupAtual) {
        document.getElementById("salvarLineup").innerText = "Salvar alterações";
    } else {
        document.getElementById("salvarLineup").innerText = "Criar line-up";
    }


    const artistas = Array.from(tabela.rows)
        .filter(row => row.id !== "linha-vazia")
        .map(row => row.cells[0]?.innerText?.trim())
        .filter(nome => nome);

    if (artistas.length === 0) {
        alert("Adicione artistas à sua line-up antes de salvar.");
        return;
    }

    fetch("/artista/salvarLineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nomeLineup,
            idUsuario,
            idLineup: idLineupAtual || null,
            artistas
        })
    })
        .then(res => {
            if (res.ok) {
                alert("Line-up salva com sucesso!");
            } else {
                alert("Erro ao salvar line-up.");
            }
                lineupModificada = false;
    atualizarEstadoBotaoSalvar();
    history.go(0);
        })
        .catch(err => {
            console.error("Erro ao salvar line-up:", err);
            alert("Erro na comunicação com o servidor.");
        });
}

function excluirLineup() {
    const select = document.getElementById("lineups");
    const idSelecionado = select.value;

    if (!idSelecionado) {
        alert("Nenhuma line-up selecionada.");
        return;
    }

    const confirmacao = confirm("Tem certeza que deseja excluir esta line-up? Esta ação não poderá ser desfeita.");
    if (!confirmacao) return;

    fetch(`/artista/lineup/${idSelecionado}`, {
        method: "DELETE"
    })
        .then(res => {
            if (res.ok) {
                alert("Line-up excluída com sucesso!");
                limparLineup();
                carregarSelectLineups(); // repopula o select
            } else {
                alert("Erro ao excluir line-up.");
            }
        })
        .catch(err => {
            console.error("Erro ao excluir line-up:", err);
            alert("Erro na comunicação com o servidor.");
        });
}

// function ajustarLargura() {
//       const input = document.getElementById('nome_lineup');
//       const medidor = document.getElementById('medidor');

//       medidor.textContent = input.value || ' ';
//       // Copia o estilo do input para o medidor (se necessário mais precisão)
//       medidor.style.font = getComputedStyle(input).font;

//       const novaLargura = medidor.offsetWidth + 2; // +2 para um pequeno espaço extra
//       input.style.width = novaLargura + 'px';
//     }
