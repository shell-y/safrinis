package school.sptech;

import org.json.JSONObject;
import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.util.*;


public class Telegram {

    private final List<String> mensagens;
    private static final String TOKEN = "7975442972:AAH0eDHTFViQDcBg4eyhZ6lWUo2B6GzXn5w";
    private static final String CHAT_ID = "-4978342921";
    private static final String BASE_URL = "https://api.telegram.org/bot" + TOKEN + "/sendMessage";
    private static final HttpClient client = HttpClient.newHttpClient();
    private final Random random = new Random();

    public Telegram(List<String> mensagens) {
        this.mensagens = mensagens;
    }

    public void enviarMensagemAleatoria() {
        String mensagem = mensagens.get(random.nextInt(mensagens.size()));
        JSONObject payload = new JSONObject();
        payload.put("chat_id", CHAT_ID);
        payload.put("text", mensagem);

        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(BASE_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                System.out.println("Mensagem enviada com sucesso!");
            } else {
                System.err.println("Erro ao enviar. Código: " + response.statusCode());
                System.err.println("Resposta: " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
