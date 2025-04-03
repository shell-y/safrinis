const axios = require('axios');
const ExcelJS = require('exceljs');

const CLIENT_ID = '1bbd0aa1fbc446cd815dcf158c1f9d00';
const CLIENT_SECRET = '550a734221904556b436c259c11657d4';

const artistsList = [
    "Stacey Ryan", "Joabe Reis", "Clariana", "Alaíde Costa", "Claudette Soares",
    "Ricardo Arantes", "Amanda Maria", "AnnaLu", "Green Day", "Sex Pistols",
    "Bruce Dickinson", "Capital Inicial", "Iggy Pop", "Pitty", "CPM 22",
    "Supla", "Inocentes", "Kamasi Washington", "Orquestra Mundana Refugi",
    "Snarky Puppy", "Leo Gandelman", "Mariah Carey", "Jessie J", "Ivete Sangalo",
    "Jacob Collier", "Vanessa Moreno", "Katy Perry", "Camila Cabello",
    "João Bosco Quarteto", "Dona Onete", "Joelma", "Gaby Amarantos", "Zaynara"
];

async function getAccessToken() {
    console.log('[AUTH] Iniciando obtenção do token de acesso...');
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
                }
            }
        );
        console.log('[AUTH] Token de acesso obtido com sucesso');
        return response.data.access_token;
    } catch (error) {
        console.error('[AUTH] Erro ao obter token de acesso:', error.message);
        throw error;
    }
}

async function getArtistInfo(artistId, accessToken) {
    console.log(`[ARTIST INFO] Buscando informações do artista ID: ${artistId}`);
    try {
        const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`[ARTIST INFO] Informações obtidas para artista ID: ${artistId}`);
        return response.data;
    } catch (error) {
        console.error(`[ARTIST INFO] Erro ao buscar informações do artista ${artistId}:`, error.message);
        return null;
    }
}

async function searchArtistId(artistName, accessToken) {
    console.log(`[SEARCH] Buscando ID para artista: "${artistName}"`);
    try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: { q: artistName, type: 'artist', limit: 1 }
        });

        if (response.data.artists.items.length === 0) {
            console.warn(`[SEARCH] Artista não encontrado: "${artistName}"`);
            return null;
        }
        
        const foundArtist = response.data.artists.items[0];
        console.log(`[SEARCH] Artista encontrado: "${artistName}" → ID: ${foundArtist.id}`);
        return foundArtist;
    } catch (error) {
        console.error(`[SEARCH] Erro ao buscar ID do artista "${artistName}":`, error.message);
        return null;
    }
}

async function getTopTracks(artistId, accessToken) {
    console.log(`[TOP TRACKS] Buscando top músicas para artista ID: ${artistId}`);
    try {
        const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: { market: 'US' }
        });
        const tracks = response.data.tracks.map(track => track.name).join(', ');
        console.log(`[TOP TRACKS] ${response.data.tracks.length} músicas encontradas para artista ID: ${artistId}`);
        return tracks;
    } catch (error) {
        console.error(`[TOP TRACKS] Erro ao buscar top tracks do artista ${artistId}:`, error.message);
        return '';
    }
}

async function getFeaturedArtists(artistId, accessToken) {
    console.log(`[RELATED ARTISTS] Buscando artistas relacionados para ID: ${artistId}`);
    try {
        const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: { include_groups: 'album,single', market: 'US', limit: 10 }
        });
        console.log(`[RELATED ARTISTS] ${response.data.items.length} álbuns encontrados para artista ID: ${artistId}`);
        
        let featuredArtists = new Set();

        for (const album of response.data.items) {
            console.log(`[RELATED ARTISTS] Buscando faixas do álbum ID: ${album.id}`);
            const albumTracks = await axios.get(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            albumTracks.data.items.forEach(track => {
                track.artists.forEach(artist => {
                    if (artist.id !== artistId) {
                        featuredArtists.add(artist.id);
                    }
                });
            });
        }
        
        console.log(`[RELATED ARTISTS] ${featuredArtists.size} artistas relacionados encontrados para ID: ${artistId}`);
        return Array.from(featuredArtists);
    } catch (error) {
        console.error(`[RELATED ARTISTS] Erro ao buscar artistas relacionados para ${artistId}:`, error.message);
        return [];
    }
}

async function saveToExcel(artistsData) {
    console.log('[EXCEL] Preparando para salvar dados no Excel...');
    const workbook = new ExcelJS.Workbook();
    const artistsSheet = workbook.addWorksheet('Artistas');
    const currentDate = new Date().toLocaleDateString();

    artistsSheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Nome', key: 'name', width: 30 },
        { header: 'Popularidade', key: 'popularity', width: 15 },
        { header: 'Seguidores', key: 'followers', width: 15 },
        { header: 'Gêneros', key: 'genres', width: 30 },
        { header: 'URL Spotify', key: 'spotify_url', width: 50 },
        { header: 'Top Músicas', key: 'top_tracks', width: 50 },
        { header: 'ID Artista Relacionado', key: 'related_artist_id', width: 30 },
        { header: 'Data da Requisição', key: 'data_requisicao', width: 20 }
    ];

    artistsData.forEach(artist => {
        artistsSheet.addRow({
            id: artist.id,
            name: artist.name,
            popularity: artist.popularity,
            followers: artist.followers,
            genres: artist.genres,
            spotify_url: artist.spotify_url,
            top_tracks: artist.top_tracks,
            related_artist_id: artist.related_artist_id || '',
            data_requisicao: currentDate
        });
    });

    await workbook.xlsx.writeFile('artists_data.xlsx');
    console.log('[EXCEL] Dados salvos com sucesso em artists_data.xlsx');
}

async function main() {
    console.log('[MAIN] Iniciando execução do script...');
    try {
        console.log('[MAIN] Obtendo token de acesso...');
        const accessToken = await getAccessToken();
        let artistsData = new Map();

        console.log(`[MAIN] Processando lista de ${artistsList.length} artistas...`);
        for (const artist of artistsList) {
            console.log(`\n[MAIN] Processando artista: "${artist}"`);
            
            const artistInfo = await searchArtistId(artist, accessToken);
            if (!artistInfo) {
                console.log(`[MAIN] Artista "${artist}" não encontrado, pulando...`);
                continue;
            }

            console.log(`[MAIN] Obtendo detalhes para artista ID: ${artistInfo.id}`);
            const artistDetails = await getArtistInfo(artistInfo.id, accessToken);
            if (!artistDetails) continue;

            console.log(`[MAIN] Obtendo top músicas para artista ID: ${artistInfo.id}`);
            const topTracks = await getTopTracks(artistInfo.id, accessToken);
            
            console.log(`[MAIN] Buscando artistas relacionados para ID: ${artistInfo.id}`);
            const relatedArtists = await getFeaturedArtists(artistInfo.id, accessToken);

            artistsData.set(artistDetails.id, {
                id: artistDetails.id,
                name: artistDetails.name,
                popularity: artistDetails.popularity,
                followers: artistDetails.followers ? artistDetails.followers.total : 0,
                genres: artistDetails.genres ? artistDetails.genres.join(', ') : '',
                spotify_url: artistDetails.external_urls.spotify,
                top_tracks: topTracks,
                related_artist_id: null
            });

            console.log(`[MAIN] Processando ${relatedArtists.length} artistas relacionados para ${artistDetails.name}`);
            for (const relatedId of relatedArtists) {
                if (!artistsData.has(relatedId)) {
                    console.log(`[MAIN] Obtendo detalhes do artista relacionado ID: ${relatedId}`);
                    const relatedDetails = await getArtistInfo(relatedId, accessToken);
                    if (relatedDetails) {
                        artistsData.set(relatedDetails.id, {
                            id: relatedDetails.id,
                            name: relatedDetails.name,
                            popularity: relatedDetails.popularity || 0,
                            followers: relatedDetails.followers ? relatedDetails.followers.total : 0,
                            genres: relatedDetails.genres ? relatedDetails.genres.join(', ') : '',
                            spotify_url: relatedDetails.external_urls ? relatedDetails.external_urls.spotify : '',
                            top_tracks: '',
                            related_artist_id: artistDetails.id
                        });
                    }
                }
            }
        }

        console.log(`[MAIN] Total de ${artistsData.size} artistas coletados, salvando no Excel...`);
        await saveToExcel(Array.from(artistsData.values()));
        console.log('[MAIN] Script concluído com sucesso!');
    } catch (error) {
        console.error('[MAIN] Erro geral:', error.message);
    }
}

main();