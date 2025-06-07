package school.sptech;

import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.sql.*;
import java.text.NumberFormat;
import java.util.*;

public class Telegram {

    private static final String TOKEN = "7975442972:AAH0eDHTFViQDcBg4eyhZ6lWUo2B6GzXn5w";
    private static final String CHAT_ID = "-4821593736";
    private static final String BASE_URL = "https://api.telegram.org/bot" + TOKEN + "/sendMessage";
    private static final HttpClient client = HttpClient.newHttpClient();

    private static final String DB_URL = "jdbc:mysql://localhost:3306/Sonora";
    private static final String DB_USER = "";
    private static final String DB_PASSWORD = "";

    static class ArtistaRelatorio {
        String nome;
        int ouvintesAtual;
        int ouvintesPassado;
        int popularidade;
        int playsSemanaAtual;
        double crescimentoPercentual;

        public ArtistaRelatorio(String nome, int ouvintesAtual, int ouvintesPassado, int popularidade, int playsSemanaAtual) {
            this.nome = nome;
            this.ouvintesAtual = ouvintesAtual;
            this.ouvintesPassado = ouvintesPassado;
            this.popularidade = popularidade;
            this.playsSemanaAtual = playsSemanaAtual;
            this.crescimentoPercentual = ouvintesPassado > 0
                    ? ((ouvintesAtual - ouvintesPassado) / (double) ouvintesPassado) * 100
                    : 0;
        }
    }

    public static void enviarRelatorioSemanal() {
        StringBuilder mensagem = new StringBuilder("🎶 *Relatório Semanal*\n\n");

        Map<Integer, String> nomesPalcos = Map.of(
                    1, "Palco Thunder",
                11, "Palco Sunset",
                22, "Palco Tardezinha"
        );

        List<Integer> palcos = Arrays.asList(1, 11, 22);
        NumberFormat nf = NumberFormat.getInstance(new Locale("pt", "BR"));

        for (Integer palco : palcos) {
            List<ArtistaRelatorio> relatorio = gerarRelatorioPorPalco(palco);

            mensagem.append("*").append(nomesPalcos.getOrDefault(palco, "Palco Misterioso")).append("*\n");

            ArtistaRelatorio topArtista = null;

            for (ArtistaRelatorio ar : relatorio) {
                String emojiCrescimento = ar.crescimentoPercentual > 0 ? "🚀" : (ar.crescimentoPercentual < 0 ? "🔻" : "➖");

                mensagem.append(String.format(
                        "🎤 %s\n" +
                                "   👥 Ouvintes da Semana: %s %s\n" +
                                "   🔊 Plays da Semana: %s\n" +
                                "   📊 Popularidade Atual: %d/100\n\n",
                        ar.nome,
                        nf.format(ar.ouvintesAtual),
                        emojiCrescimento,
                        nf.format(ar.playsSemanaAtual),
                        ar.popularidade
                ));

                if (topArtista == null || ar.crescimentoPercentual > topArtista.crescimentoPercentual) {
                    topArtista = ar;
                }
            }

            if (topArtista != null) {
                mensagem.append(String.format(
                        "🏆 Artista com maior crescimento em ouvintes: %s (+%.2f%%)\n\n",
                        topArtista.nome,
                        topArtista.crescimentoPercentual
                ));
            }
        }

        mensagem.append("⏰ Próximo relatório: Segunda-feira que vem!");
        enviarMensagemTelegram(mensagem.toString());
    }

    private static List<ArtistaRelatorio> gerarRelatorioPorPalco(int fkRelacionadoA) {
        List<ArtistaRelatorio> artistas = new ArrayList<>();

        String query = """
            SELECT
                a.nome,
                SUM(CASE WHEN lf.dataColeta BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() THEN lf.ouvintes ELSE 0 END) AS ouvintes_semana_atual,
                SUM(CASE WHEN lf.dataColeta BETWEEN DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND DATE_SUB(CURDATE(), INTERVAL 8 DAY) THEN lf.ouvintes ELSE 0 END) AS ouvintes_semana_passada,
                MAX(sp.popularidade) AS popularidade,
                SUM(CASE WHEN lf.dataColeta BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() THEN lf.plays ELSE 0 END) AS plays_semana_atual
            FROM
                Artista a
            LEFT JOIN LastFm lf ON lf.fkArtista = a.idArtista
            LEFT JOIN Spotify sp ON sp.fkArtista = a.idArtista
            WHERE a.fkRelacionadoA = ?
            GROUP BY a.idArtista
            ORDER BY (ouvintes_semana_atual - ouvintes_semana_passada) DESC
            LIMIT 3;
        """;

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, fkRelacionadoA);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ArtistaRelatorio ar = new ArtistaRelatorio(
                            rs.getString("nome"),
                            rs.getInt("ouvintes_semana_atual"),
                            rs.getInt("ouvintes_semana_passada"),
                            rs.getInt("popularidade"),
                            rs.getInt("plays_semana_atual")
                    );
                    artistas.add(ar);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return artistas;
    }

    private static void enviarMensagemTelegram(String mensagem) {
        JSONObject payload = new JSONObject();
        payload.put("chat_id", CHAT_ID);
        payload.put("text", mensagem);
        payload.put("parse_mode", "Markdown");

        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(BASE_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                System.out.println("✅ Relatório enviado com sucesso!");
            } else {
                System.err.println("❌ Erro ao enviar. Código: " + response.statusCode());
                System.err.println("Resposta: " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
