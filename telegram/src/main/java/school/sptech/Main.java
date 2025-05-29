package school.sptech;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> mensagensSemanais = List.of(
                "VAI CORINTHIANS",
                "VAI CORINTHIANS",
                "VAI CORINTHIANS"
        );

        Telegram telegram = new Telegram(mensagensSemanais);
        telegram.enviarMensagemAleatoria();
    }
}