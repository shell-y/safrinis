let artistaSelecionado = "Bruno Mars";
let dadosGrafico = {};
let grafico;
let graficoPlays;

function identificadorDash() {
    let elementoNome = document.getElementById('nome');
    if (elementoNome && sessionStorage.NOME_USUARIO) {
        elementoNome.innerText += ` ${artistaSelecionado}`;
    }
}

// Atualiza os KPIs consultando a API
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

        if (!response.ok) throw new Error('Erro na requisição');

        const kpis = await response.json();

        document.getElementById('periodo-plays').textContent = `${periodo} dias`;
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

function prepararDadosGraficoPlays(dados) {
    dados.sort((a, b) => new Date(a["Data da Requisição"]) - new Date(b["Data da Requisição"]));

    const labels = dados.map(item => new Date(item["Data da Requisição"]).toLocaleDateString('pt-BR'));
    const playsData = dados.map(item => item.Plays || 0);

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
                backgroundColor: 'rgba(56, 200, 113, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Plays Diários do Artista',
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Número de Plays' }
                },
                x: {
                    title: { display: true, text: 'Data' }
                }
            }
        }
    });
}

async function carregarArtistasRelacionados(artistaId) {
    try {
        const response = await fetch('artists_data.json');
        const data = await response.json();

        const relacionados = data.filter(item => item["ID Artista Relacionado"] === artistaId).slice(0, 8);
        renderizarSonar(relacionados);
    } catch (error) {
        console.error('Erro ao carregar artistas relacionados:', error);
    }
}

function renderizarSonar(artistas) {
    const artistaCentral = document.getElementById('artista-central');
    const orbitas = document.getElementById('orbitas');

    artistaCentral.textContent = artistaSelecionado;
    orbitas.innerHTML = '';

    artistas.forEach((artista, index) => {
        const angulo = (index * (360 / artistas.length)) % 360;
        const distancia = 150 + (Math.floor(index / 4) * 100);

        const x = Math.cos(angulo * Math.PI / 180) * distancia;
        const y = Math.sin(angulo * Math.PI / 180) * distancia;

        const planeta = document.createElement('div');
        planeta.className = 'planeta';
        planeta.textContent = artista.Nome;
        planeta.style.left = `calc(50% + ${x}px)`;
        planeta.style.top = `calc(50% + ${y}px)`;
        planeta.title = `${artista.Nome}\nPopularidade: ${artista.Popularidade}`;

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

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    identificadorDash();
    atualizarKPIs();

    const periodoSelect = document.getElementById('periodo-select');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', atualizarKPIs);
    }
});
