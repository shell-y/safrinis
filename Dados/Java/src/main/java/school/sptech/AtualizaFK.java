package school.sptech;

import java.sql.*;
import java.util.Map;
import java.util.logging.Logger;

public class AtualizaFK {
    private static final Logger logger = LoggerUtil.setupLogger("AtualizaFK", false);

    private static final Map<String, String> GRUPOS_FK = Map.ofEntries(
            Map.entry("Bruno Mars", "Bruno Mars"), Map.entry("Ne-Yo", "Bruno Mars"), Map.entry("Sean Kingston", "Bruno Mars"),
            Map.entry("Justin Timberlake", "Bruno Mars"), Map.entry("Justin Bieber", "Bruno Mars"), Map.entry("USHER", "Bruno Mars"),
            Map.entry("Maroon 5", "Bruno Mars"), Map.entry("David Guetta", "Bruno Mars"), Map.entry("The Weeknd", "Bruno Mars"),
            Map.entry("Akon", "Bruno Mars"), Map.entry("ZAYN", "Bruno Mars"),

            Map.entry("Lady Gaga", "Lady Gaga"), Map.entry("Beyoncé", "Lady Gaga"), Map.entry("Dua Lipa", "Lady Gaga"),
            Map.entry("Madonna", "Lady Gaga"), Map.entry("Britney Spears", "Lady Gaga"), Map.entry("Kylie Minogue", "Lady Gaga"),
            Map.entry("Miley Cyrus", "Lady Gaga"), Map.entry("Taylor Swift", "Lady Gaga"), Map.entry("Ariana Grande", "Lady Gaga"),
            Map.entry("Katy Perry", "Lady Gaga"), Map.entry("Sabrina Carpenter", "Lady Gaga"),

            Map.entry("Thiaguinho", "Thiaguinho"), Map.entry("Péricles", "Thiaguinho"), Map.entry("Arlindo Cruz", "Thiaguinho"),
            Map.entry("Ferrugem", "Thiaguinho"), Map.entry("Grupo Menos É Mais", "Thiaguinho"), Map.entry("Sorriso Maroto", "Thiaguinho"),
            Map.entry("Zeca Pagodinho", "Thiaguinho"), Map.entry("Pixote", "Thiaguinho"), Map.entry("Grupo Revelação", "Thiaguinho"),
            Map.entry("Turma do Pagode", "Thiaguinho"), Map.entry("Belo", "Thiaguinho")
    );

    public void atualizarFK() {
        String sqlBuscarId = "SELECT idArtista FROM Artista WHERE LOWER(nome) = LOWER(?)";
        String sqlAtualizarFK = "UPDATE Artista SET fkRelacionadoA = ? WHERE LOWER(nome) = LOWER(?)";

        try (
                Connection conn = DriverManager.getConnection(
                        Config.get("db.url"),
                        Config.get("db.user"),
                        Config.get("db.password")
                );
                PreparedStatement stmtBuscar = conn.prepareStatement(sqlBuscarId);
                PreparedStatement stmtAtualizar = conn.prepareStatement(sqlAtualizarFK)
        ) {
            for (Map.Entry<String, String> entry : GRUPOS_FK.entrySet()) {
                String nomeArtista = entry.getKey().trim().toLowerCase();
                String nomeReferencia = entry.getValue().trim().toLowerCase();

                stmtBuscar.setString(1, nomeReferencia);
                try (ResultSet rs = stmtBuscar.executeQuery()) {
                    if (rs.next()) {
                        int idReferencia = rs.getInt("idArtista");

                        stmtAtualizar.setInt(1, idReferencia);
                        stmtAtualizar.setString(2, nomeArtista);
                        int linhasAtualizadas = stmtAtualizar.executeUpdate();

                        if (linhasAtualizadas > 0) {
                            logger.info("FK atualizada para " + nomeArtista + " -> " + nomeReferencia);
                        } else {
                            logger.warning("Artista para atualizar FK não encontrado: " + nomeArtista);
                        }
                    } else {
                        logger.warning("Artista de referência não encontrado: " + nomeReferencia);
                    }
                }
            }
        } catch (SQLException e) {
            logger.severe("Erro ao atualizar FK: " + e.getMessage());
        }
    }
}
