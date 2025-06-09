const artistaSelecionado = sessionStorage.nomeArtista;

document.querySelector("#span_nome_artista").innerText = artistaSelecionado;

let dadosGrafico = {};
let grafico;
let graficoPlays;

function identificadorDash() {
    let elementoNome = document.getElementById('nome');
    if (elementoNome && sessionStorage.NOME_USUARIO) {
        elementoNome.innerText += ` ${artistaSelecionado}`;
    }
}

async function atualizarKPIs() {
    console.log("Atualizando KPIS");
    const periodoSelect = document.getElementById('periodo-select');
    const periodo = periodoSelect ? periodoSelect.value : '7';

    try {
        const response = await fetch("/dashboard/getKpi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                artistaServer: artistaSelecionado,
                periodoServer: periodo
            })
        });

        if (!response.ok) throw new Error('Erro na requisição (/dashboard/getKpi)');

        const kpis = await response.json();

        document.getElementById('periodo-plays').textContent = ` ${periodo} dias`;
        document.getElementById('crescimento-plays').textContent = `${kpis.crescimentoPlays}%`;
        document.getElementById('crescimento-ouvintes').textContent = `${kpis.crescimentoOuvintes}%`;
        document.getElementById('popularidade').textContent = `${kpis.popularidade}%`;

        const onTourElement = document.getElementById('ontour');
        onTourElement.textContent = kpis.onTour ? 'SIM' : 'NÃO';
        onTourElement.style.color = kpis.onTour ? 'green' : 'red';

    } catch (error) {
        console.error('Erro ao atualizar KPIs:', error);
        document.getElementById('crescimento-plays').textContent = 'Não encontrado';
        document.getElementById('crescimento-ouvintes').textContent = 'Não encontrado';
        document.getElementById('popularidade').textContent = 'Não encontrado';
        document.getElementById('ontour').textContent = 'Não encontrado';
    }
}

async function prepararDadosGraficoPlays(artistaSelecionado) {
    console.log("Atualizando KPIS");
    const periodo = document.getElementById('periodo-select').value;

    try {
        const response = await fetch("/dashboard/getPlays", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                artistaServer: artistaSelecionado,
                periodoServer: periodo
            })
        });

        if (!response.ok) throw new Error('Erro na requisição (/dashboard/getPlays)');

        const playsArtista = await response.json();

        const labels = playsArtista.map(item => {
            const data = new Date(item.DATACOLETA);
            return data.toLocaleDateString('pt-BR');
        });

        const playsData = playsArtista.map(item => item.TOTALPLAYS);

        const ctx = document.getElementById('grafico-plays').getContext('2d');

        if (graficoPlays) {
            graficoPlays.destroy();
        }

        graficoPlays = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Plays Diários',
                    data: playsData,
                    borderColor: '#38c871',
                    tension: 0.5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Número Total de Reproduções por Dia',
                        font: { size: 20 },
                        color: '#ffffff'
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Data',
                            color: '#ffffff',
                            font: {
                                size: 16
                            }
                        },
                        ticks: {
                            color: '#ffffff',
                            font: { size: 13 }
                        },
                        grid: {
                            color: '#404040',
                            lineWidth: 1
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Número de Plays',
                            color: '#ffffff',
                            font: {
                                size: 16
                            }
                        },
                        ticks: {
                            color: '#ffffff',
                            font: { size: 13 }
                        },
                        grid: {
                            color: '#404040',
                            lineWidth: 1
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar gráfico plays/periodo:', error);
    }
}

async function carregarArtistasRelacionados(artistaSelecionado) {
    try {
        const response = await fetch("/dashboard/getArtistaRelacionado", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                artistaServer: artistaSelecionado
            })
        });

        if (!response.ok) throw new Error('Erro na requisição');

        const artistasRelacionados = await response.json();

        const NomesRelacionados = artistasRelacionados.map(item => item.nome);

        renderizarSonar(NomesRelacionados);
    } catch (error) {
        console.error('Erro ao carregar artistas relacionados:', error);
    }
}

function renderizarSonar(artistas) {
    const artistaCentral = document.getElementById('artista-central');
    const orbitas = document.getElementById('orbitas');

    artistaCentral.textContent = artistaSelecionado;
    orbitas.innerHTML = '';

    function criarOrbita(tamanho) {
        const orbita = document.createElement('div');
        orbita.className = 'orbita';
        orbita.style.width = `${tamanho}px`;
        orbita.style.height = `${tamanho}px`;
        return orbita;
    }

    orbitas.appendChild(criarOrbita(240));
    orbitas.appendChild(criarOrbita(400));

    artistas.forEach((artista, index) => {
        const distancia = index < 5 ? 120 : 200;

        let angulo;
        if (index < 5) {
            angulo = index * (360 / 5);
        } else {
            angulo = (index - 5) * (360 / 5) + 36;
        }

        const x = Math.cos(angulo * Math.PI / 180) * distancia;
        const y = Math.sin(angulo * Math.PI / 180) * distancia;

        const planeta = document.createElement('div');
        planeta.className = 'planeta';
        planeta.textContent = artista;
        planeta.style.left = `calc(50% + ${x}px)`;
        planeta.style.top = `calc(50% + ${y}px)`;
        planeta.title = artista;
        planeta.setAttribute('onclick', `trocarArtistaSelecionado('${artista}')`);

        orbitas.appendChild(planeta);
    });
}

function atualizarGraficoPorSelect() {
    const select = document.getElementById('artista-select');
    if (select) {
        artistaSelecionado = select.value;
        carregarDadosArtista();
    }
}

let graficoRanking = null;
let graficoComparativo = null;

async function trocarArtistaSelecionado(nomeArtistaRelacionada) {
    const artistaCentralNome = artistaSelecionado;

    // Esconde sonar, gráfico de plays
    document.querySelector(".charts-container").style.display = "none";
    document.getElementById("secao-comparacao").classList.add("mostrar");

    document.getElementById("periodo-select").style.display = "none";
    document.getElementById("btn-voltar").style.display = "grid";

    try {
        // Pega ID dos artistas no banco
        const [resCentral, resRelacionado] = await Promise.all([
            fetch("/dashboard/getArtistaRelacionado", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ artistaServer: artistaCentralNome })
            }),
            fetch("/dashboard/getArtistaRelacionado", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ artistaServer: nomeArtistaRelacionada })
            })
        ]);

        const listaRelacionados = await resCentral.json();
        const artistaComparado = listaRelacionados.find(a => a.nome === nomeArtistaRelacionada);
        if (!artistaComparado) throw new Error("Artista relacionado não encontrado na lista.");

        gerarGraficoRanking(listaRelacionados);
        gerarGraficoComparativo(artistaCentralNome, nomeArtistaRelacionada);

    } catch (error) {
        console.error("Erro ao trocar artista:", error);
    }
}

function gerarGraficoRanking(artistas) {
    const nomes = artistas.map(a => a.nome);
    const plays = artistas.map(a => a.totalPlays);

    const ctx = document.getElementById('grafico-ranking').getContext('2d');
    if (graficoRanking) graficoRanking.destroy();

    graficoRanking = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [{
                label: 'Total de Plays (últimos 90 dias)',
                data: plays,
                backgroundColor: '#38c871'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Ranking de Artistas Relacionados por Total de Plays',
                    color: '#ffffff',
                    font: { size: 18 }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: '#333' }
                },
                y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: '#333' }
                }
            }
        }
    });
}


async function gerarGraficoComparativo(central, comparado) {
    try {
        const response = await fetch("/dashboard/compararArtistas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ artistaA: central, artistaB: comparado })
        });

        if (!response.ok) throw new Error("Erro na API /compararArtistas");

        const dados = await response.json();
        const labels = Object.keys(dados[central]);

        const ctx = document.getElementById('grafico-comparativo').getContext('2d');
        if (graficoComparativo) graficoComparativo.destroy();

        graficoComparativo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: central,
                        data: labels.map(k => dados[central][k]),
                        backgroundColor: '#579edc'
                    },
                    {
                        label: comparado,
                        data: labels.map(k => dados[comparado][k]),
                        backgroundColor: '#38c871'
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Comparativo: ${central} vs ${comparado}`,
                        color: '#ffffff',
                        font: { size: 18 }
                    },
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#333' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#333' }
                    }
                }
            }
        });

    } catch (erro) {
        console.error("Erro ao gerar gráfico comparativo:", erro);
    }
}


function voltarParaSonar() {
    document.querySelector(".charts-container").style.display = "grid";
    document.getElementById("secao-comparacao").classList.remove("mostrar");

    document.getElementById("periodo-select").style.display = "grid";
    document.getElementById("btn-voltar").style.display = "none";
}


// Eventos
document.addEventListener('DOMContentLoaded', () => {
    identificadorDash();
    atualizarKPIs();
    carregarArtistasRelacionados(artistaSelecionado);
    prepararDadosGraficoPlays(artistaSelecionado);

    const periodoSelect = document.getElementById('periodo-select');

    function atualizarTudo() {
        atualizarKPIs();
        prepararDadosGraficoPlays(artistaSelecionado);
    }

    if (periodoSelect) {
        periodoSelect.addEventListener('change', atualizarTudo);
    }
});

