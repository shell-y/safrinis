package school.sptech;

import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.sql.*;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

public class Telegram {

    // Configurações do Telegram
    private static final String TOKEN = "7975442972:AAH0eDHTFViQDcBg4eyhZ6lWUo2B6GzXn5w";
    private static final String CHAT_ID = "-4978342921";
    private static final String BASE_URL = "https://api.telegram.org/bot" + TOKEN + "/sendMessage";
    private static final HttpClient client = HttpClient.newHttpClient();

    // Configurações do MySQL
    private static final String DB_URL = "jdbc:mysql://localhost:3306/Sonora";
    private static final String DB_USER = "sonora";
    private static final String DB_PASSWORD = "170170aA@";

    static class ArtistaRelatorio {
        String nome;
        int ouvintesAtual;
        int ouvintesPassado;
        int playsAtual;
        int playsPassado;
        int popularidade;
        double crescimentoOuvintes;
        double crescimentoPlays;

        public ArtistaRelatorio(String nome, int ouvintesAtual, int ouvintesPassado, int playsAtual, int playsPassado, int popularidade) {
            this.nome = nome;
            this.ouvintesAtual = ouvintesAtual;
            this.ouvintesPassado = ouvintesPassado;
            this.playsAtual = playsAtual;
            this.playsPassado = playsPassado;
            this.popularidade = popularidade;
            this.crescimentoOuvintes = calcularCrescimentoPercentual(ouvintesPassado, ouvintesAtual);
            this.crescimentoPlays = calcularCrescimentoPercentual(playsPassado, playsAtual);
        }
    }

    public static void enviarRelatorioSemanal() {
        List<ArtistaRelatorio> relatorio = gerarRelatorioSemanal();
        String mensagem = formatarMensagem(relatorio);
        enviarMensagemTelegram(mensagem);
    }

    private static List<ArtistaRelatorio> gerarRelatorioSemanal() {
        List<ArtistaRelatorio> artistas = new ArrayList<>();
        String query = """
                SELECT
                    a.nome,
                    SUM(CASE WHEN lf.dataColeta BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() THEN lf.ouvintes ELSE 0 END) AS ouvintes_semana_atual,
                    SUM(CASE WHEN lf.dataColeta BETWEEN DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND DATE_SUB(CURDATE(), INTERVAL 8 DAY) THEN lf.ouvintes ELSE 0 END) AS ouvintes_semana_passada,
                    SUM(CASE WHEN lf.dataColeta BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() THEN lf.plays ELSE 0 END) AS plays_semana_atual,
                    SUM(CASE WHEN lf.dataColeta BETWEEN DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND DATE_SUB(CURDATE(), INTERVAL 8 DAY) THEN lf.plays ELSE 0 END) AS plays_semana_passada,
                    MAX(sp.popularidade) AS popularidade
                FROM
                    Artista a
                LEFT JOIN LastFm lf ON lf.fkArtista = a.idArtista
                LEFT JOIN Spotify sp ON sp.fkArtista = a.idArtista
                GROUP BY
                    a.idArtista, a.nome
                ORDER BY
                    ouvintes_semana_atual DESC
                LIMIT 3
            """;

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                ArtistaRelatorio ar = new ArtistaRelatorio(
                        rs.getString("nome"),
                        rs.getInt("ouvintes_semana_atual"),
                        rs.getInt("ouvintes_semana_passada"),
                        rs.getInt("plays_semana_atual"),
                        rs.getInt("plays_semana_passada"),
                        rs.getInt("popularidade")
                );
                artistas.add(ar);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return artistas;
    }

    private static double calcularCrescimentoPercentual(int valorAnterior, int valorAtual) {
        if (valorAnterior == 0) {
            return valorAtual > 0 ? 100.0 : 0.0; // Evita divisão por zero
        }
        return ((double) (valorAtual - valorAnterior) / valorAnterior) * 100;
    }

    private static String formatarMensagem(List<ArtistaRelatorio> relatorio) {
        StringBuilder sb = new StringBuilder();
        sb.append("🎶 *Relatório Semanal de Artistas*\n\n");

        ArtistaRelatorio maiorCrescimento = relatorio.stream()
                .max(Comparator.comparingDouble(a -> a.crescimentoOuvintes))
                .orElse(null);

        ArtistaRelatorio maisPopular = relatorio.stream()
                .max(Comparator.comparingInt(a -> a.popularidade))
                .orElse(null);

        NumberFormat nf = NumberFormat.getInstance(new Locale("pt", "BR"));

        for (ArtistaRelatorio ar : relatorio) {
            String emojiOuvintes = ar.crescimentoOuvintes > 0 ? "📈" : (ar.crescimentoOuvintes < 0 ? "📉" : "➖");
            String emojiPlays = ar.crescimentoPlays > 0 ? "📈" : (ar.crescimentoPlays < 0 ? "📉" : "➖");

            sb.append(String.format(
                    "🎤 Artista: %s\n" +
                            "   👥 Ouvintes: %s (%+.2f%%) %s\n" +
                            "   🔄 Plays: %s (%+.2f%%) %s\n" +
                            "   📊 Popularidade: %d/100\n\n",
                    ar.nome,
                    nf.format(ar.ouvintesAtual), ar.crescimentoOuvintes, emojiOuvintes,
                    nf.format(ar.playsAtual), ar.crescimentoPlays, emojiPlays,
                    ar.popularidade
            ));
        }

        if (maiorCrescimento != null) {
            sb.append(String.format("🏆 *Maior crescimento de ouvintes*: %s (+%.2f%%)\n", maiorCrescimento.nome, maiorCrescimento.crescimentoOuvintes));
        }

        if (maisPopular != null) {
            sb.append(String.format("🔥 *Artista mais popular*: %s (%d/100)\n", maisPopular.nome, maisPopular.popularidade));
        }

        sb.append("\n⏰ Próximo relatório: Segunda-feira que vem!");

        return sb.toString();
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
