    package school.sptech;

    import java.time.LocalDateTime;
    import java.time.format.DateTimeFormatter;
    import java.util.Timer;
    import java.util.TimerTask;
    import java.util.concurrent.ThreadLocalRandom;

    public class Main {
        public static void main(String[] args) {

            /*
            System.out.println("\n" +
                    "╔═╗╔═╗╔╗╔╔═╗╦═╗╔═╗\n" +
                    "╚═╗║ ║║║║║ ║╠╦╝╠═╣\n" +
                    "╚═╝╚═╝╝╚╝╚═╝╩╚═╩ ╩");
            */
            System.out.println("\n" +
                    "_________________________________\n"+
                    "   ________  _  ______  ___  ___ \n" +
                    "  / __/ __ \\/ |/ / __ \\/ _ \\/ _ |\n" +
                    " _\\ \\/ /_/ /    / /_/ / , _/ __ |\n" +
                    "/___/\\____/_/|_/\\____/_/|_/_/ |_|");
            System.out.println(
                    "_________________________________\n"+
                    "   DADOS, NA VELOCIDADE DO SOM\n"+
                    "---------------------------------\n");


            Timer exibirHora = new Timer(); // Criação do timer
            DateTimeFormatter formatarHora = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"); // Formatador do timer

            String[] listaMensagens = {
                    "[SECURITY] Tentativa de login bem-sucedida.",
                    "[SECURITY] Tentativa de login falhou.",
                    "[ERROR] Falha ao atualizar cadastro. Tentando novamente...",
                    "[SUCCESS] Cadastro atualizado com sucesso."
            };


            TimerTask criarTimer = new TimerTask() {
            Integer contadorErro = 0; // Contador de falhas
                @Override
                public void run() {
                    // pegando a hora atual [.now()] e formatando [.format()]
                    String horario = LocalDateTime.now().format(formatarHora);

                    // criando uma String para sortear aleatoriamente as mensagens
                    String mensagemAleatoria = listaMensagens[ThreadLocalRandom.current().nextInt(listaMensagens.length)];

                    Integer idAleatorio = ThreadLocalRandom.current().nextInt(10000, 100000);

                    // Verificando se a mensagem é a de erro para adicionar ao contador
                    if (mensagemAleatoria.equals(listaMensagens[2])) {
                        // Incrementando o contador de erros
                        contadorErro++;
                    }

                    // Se o contador de erros atingir 2, exibe a mensagem [WARNING]
                    if (contadorErro > 2) {
                        // Exibindo a mensagem de aviso [2] após 3 falhas
                        if (mensagemAleatoria.equals(listaMensagens[2])) {
                            mensagemAleatoria = listaMensagens[2] + "\n[" + horario +
                            "] [FALHA #" + contadorErro + "] \033[0;31m[WARNING]\033[0m Múltiplas falhas detectadas!";
                            /* Código ANSI para mudar a cor:
                            \033[0;31m -> para iniciar o vermelho. 31 é o cód do vermelho
                            \033[0m -> para finalizar o vermelho/voltar para o cód 0 */
                        }
                    }

                    System.out.printf(
                            "[%s] [ID %d] %s\n", horario, idAleatorio, mensagemAleatoria
                    );
                }
            };
            // Executa a TimerTask "criarTimer" a cada 1.5 segundos
            exibirHora.scheduleAtFixedRate(criarTimer, 0, 1000);


        } // FIM MAIN
    } // FIM CLASSE