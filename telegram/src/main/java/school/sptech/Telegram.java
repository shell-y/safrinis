package school.sptech;

import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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

    public static void enviarRelatorioSemanal() {
        List<String> relatorio = gerarRelatorioSemanal();
        String mensagem = formatarMensagem(relatorio);
        enviarMensagemTelegram(mensagem);
    }

    private static List<String> gerarRelatorioSemanal() {
        List<String> linhas = new ArrayList<>();
        String query = """
        SELECT
            a.nome,
            lf.ouvintes,
            lf.plays,
            sp.popularidade
        FROM
            Artista a
            LEFT JOIN LastFm lf ON lf.fkArtista = a.idArtista
            LEFT JOIN Spotify sp ON sp.fkArtista = a.idArtista
        WHERE
            lf.dataColeta = (
                SELECT MAX(dataColeta) FROM LastFm WHERE fkArtista = a.idArtista
            )
            AND sp.dtRequisicao = (
                SELECT MAX(dtRequisicao) FROM Spotify WHERE fkArtista = a.idArtista
            )
        ORDER BY
            lf.ouvintes DESC
        LIMIT 3
        """;

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            int posicao = 1;

            while (rs.next()) {
                String nome = rs.getString("nome");
                int ouvintes = rs.getInt("ouvintes");
                int plays = rs.getInt("plays");
                int popularidade = rs.getInt("popularidade");
                //double crescimento = rs.getDouble("crescimento_percentual");
                // String tendencia = rs.getString("tendencia");

                String linha = String.format("""
                        %d️⃣ Artista: %s
                           👥 Ouvintes: %d
                           🔄 Plays: %d
                           📊 Popularidade: %d/100
                        """, posicao, nome, ouvintes, plays, popularidade);

                linhas.add(linha);
                posicao++;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            linhas.add("❌ Erro ao gerar relatório: " + e.getMessage());
        }

        return linhas;
    }

    private static String formatarMensagem(List<String> relatorio) {
        StringBuilder sb = new StringBuilder();
        sb.append("🎶 *Relatório Semanal de Artistas*\n\n");
        for (String linha : relatorio) {
            sb.append(linha).append("\n");
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


