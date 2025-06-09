package school.sptech;

import java.io.IOException;
import java.nio.file.*;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.*;

public class LoggerUtil {

    private static final String LOG_FOLDER = System.getenv().getOrDefault("log.folder.java", "logs");
    private static final String LOG_FILE = "app.log";

    // Códigos ANSI para cores no terminal
    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_GREEN = "\u001B[32m";
    private static final String ANSI_RED = "\u001B[31m";

    public static Logger setupLogger(String nomeLogger, boolean apenasConsole) {
        Logger logger = Logger.getLogger(nomeLogger);
        logger.setUseParentHandlers(false);

        if (logger.getHandlers().length > 0) return logger;

        try {
            Files.createDirectories(Paths.get(LOG_FOLDER));

            Formatter formatter = new Formatter() {
                private final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

                @Override
                public String format(LogRecord record) {
                    String time = sdf.format(new Date(record.getMillis()));
                    String status = record.getLevel().getName();
                    String tag = record.getLoggerName();
                    String mensagem = formatMessage(record);

                    salvarLogNoBanco(status, tag, mensagem, new Date(record.getMillis()));

                    // Colorir verde para todos, exceto SEVERE que fica vermelho
                    String cor = (record.getLevel() == Level.SEVERE) ? ANSI_RED : ANSI_GREEN;

                    return String.format("%s[%s] [%s] %s%s%n", cor, time, status, mensagem, ANSI_RESET);
                }
            };

            ConsoleHandler consoleHandler = new ConsoleHandler();
            consoleHandler.setFormatter(formatter);
            consoleHandler.setLevel(Level.ALL);
            logger.addHandler(consoleHandler);

            if (!apenasConsole) {
                FileHandler fileHandler = new FileHandler(LOG_FOLDER + "/" + LOG_FILE, true);
                fileHandler.setFormatter(formatter);
                fileHandler.setLevel(Level.ALL);
                logger.addHandler(fileHandler);
            }

            logger.setLevel(Level.ALL);

        } catch (IOException e) {
            e.printStackTrace();
        }

        return logger;
    }

    public static void salvarLogNoBanco(String status, String classe, String mensagem, Date dataHora) {
        String sql = "INSERT INTO LogExecucao (status, classe, mensagem, dataHora) VALUES (?, ?, ?, ?)";

        try (
                Connection conn = DriverManager.getConnection(Config.get("db.url"), Config.get("db.user"), Config.get("db.password"));
                PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, status);
            stmt.setString(2, classe);
            stmt.setString(3, mensagem);
            stmt.setTimestamp(4, new Timestamp(dataHora.getTime()));
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
