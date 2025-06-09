package school.sptech;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Map;
import java.util.logging.Logger;
import school.sptech.artistas.ArtistaSpotify;
import school.sptech.artistas.ArtistaLastFM;

public class ArtistaDAO {

    private static final Logger logger = LoggerUtil.setupLogger("ArtistaDAO", false);
    private static final String URL = Config.get("db.url");
    private static final String USUARIO = Config.get("db.user");
    private static final String SENHA = Config.get("db.password");

    public void salvarNomeArtista(String nome) {
        String sqlVerificar = "SELECT COUNT(*) FROM Artista WHERE nome = ?";
        String sqlInserir = "INSERT INTO Artista (nome) VALUES (?)";

        try (
                Connection conn = DriverManager.getConnection(URL, USUARIO, SENHA);
                PreparedStatement stmtVerificar = conn.prepareStatement(sqlVerificar);
                PreparedStatement stmtInserir = conn.prepareStatement(sqlInserir, Statement.RETURN_GENERATED_KEYS)
        ) {
            stmtVerificar.setString(1, nome);
            ResultSet rs = stmtVerificar.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                logger.warning("Artista já existe: " + nome);
                return;
            }

            stmtInserir.setString(1, nome);
            stmtInserir.executeUpdate();
            logger.info("Artista inserido: " + nome);

        } catch (SQLException e) {
            logger.severe("Erro ao salvar artista: " + nome + " - " + e.getMessage());
        }
    }

    public Date buscarUltimaData(String tabela, String colunaData, int fkArtista) {
        String sql = "SELECT MAX(" + colunaData + ") FROM " + tabela + " WHERE fkArtista = ?";

        try (
                Connection conn = DriverManager.getConnection(URL, USUARIO, SENHA);
                PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setInt(1, fkArtista);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getDate(1);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao buscar última data para artista " + fkArtista + ": " + e.getMessage());
        }
        return null;
    }

    public void salvarArtistaSpotify(ArtistaSpotify artista) {
        Date ultimaDataBanco = buscarUltimaData("Spotify", "dtRequisicao", artista.getFkArtista());

        Date dataExcel = validarEConverterData(artista.getDtRequisicao());
        if (dataExcel == null) {
            logger.warning("Data inválida detectada: " + artista.getDtRequisicao());
            return;
        }

        if (ultimaDataBanco == null || dataExcel.after(ultimaDataBanco)) {
            String sql = "INSERT INTO Spotify (identificadorSpotify, popularidade, seguidores, dtRequisicao, fkArtista) VALUES (?, ?, ?, ?, ?)";

            try (
                    Connection conn = DriverManager.getConnection(URL, USUARIO, SENHA);
                    PreparedStatement stmt = conn.prepareStatement(sql)
            ) {
                stmt.setString(1, artista.getIdentificadorSpotify());
                stmt.setInt(2, artista.getPopularidade());
                stmt.setInt(3, artista.getSeguidores());
                stmt.setDate(4, dataExcel);
                stmt.setInt(5, artista.getFkArtista());

                stmt.executeUpdate();

                String nomeArtista = buscarNomeArtistaPorId(artista.getFkArtista());
                logger.info("ArtistaSpotify inserido: " + (nomeArtista != null ? nomeArtista : artista.getIdentificadorSpotify()));
            } catch (SQLException e) {
                logger.severe("Erro ao salvar ArtistaSpotify: " + artista.getIdentificadorSpotify() + " - " + e.getMessage());
            }
        } else {
            String nomeArtista = buscarNomeArtistaPorId(artista.getFkArtista());
            logger.info("Ignorando inserção do Spotify para " + (nomeArtista != null ? nomeArtista : artista.getIdentificadorSpotify()) + " pois a data já existe no banco.");
        }
    }

    public boolean dadosJaForamInseridosHoje(String tabela, String colunaData) {
        String sql = "SELECT COUNT(*) FROM " + tabela + " WHERE DATE(" + colunaData + ") = CURRENT_DATE";

        try (
                Connection conn = DriverManager.getConnection(URL, USUARIO, SENHA);
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()
        ) {
            if (rs.next() && rs.getInt(1) > 0) {
                return true;
            }
        } catch (SQLException e) {
            logger.severe("Erro ao verificar inserção diária: " + e.getMessage());
        }
        return false;
    }

    public void salvarArtistaLastFM(ArtistaLastFM artista) {
        Date ultimaDataBanco = buscarUltimaData("LastFm", "dataColeta", artista.getFkArtista());

        Date dataExcel = validarEConverterData(artista.getDataColeta());
        if (dataExcel == null) {
            logger.warning("Data inválida detectada: " + artista.getDataColeta());
            return;
        }

        if (ultimaDataBanco == null || dataExcel.after(ultimaDataBanco)) {
            String sql = "INSERT INTO LastFm (idPlataforma, dataColeta, ouvintes, plays, totalPlays, onTour, fkArtista) VALUES (?, ?, ?, ?, ?, ?, ?)";

            try (
                    Connection conn = DriverManager.getConnection(URL, USUARIO, SENHA);
                    PreparedStatement stmt = conn.prepareStatement(sql)
            ) {
                stmt.setString(1, artista.getIdPlataforma());
                stmt.setDate(2, dataExcel);
                stmt.setInt(3, artista.getOuvintes());
                stmt.setInt(4, artista.getPlays());
                stmt.setInt(5, artista.getTotalPlays());
                stmt.setInt(6, artista.getOnTour());
                stmt.setInt(7, artista.getFkArtista());

                stmt.executeUpdate();

                String nomeArtista = buscarNomeArtistaPorId(artista.getFkArtista());
                logger.info("ArtistaLastFM inserido: " + (nomeArtista != null ? nomeArtista : artista.getIdPlataforma()));
            } catch (SQLException e) {
                logger.severe("Erro ao salvar ArtistaLastFM: " + artista.getIdPlataforma() + " - " + e.getMessage());
            }
        } else {
            String nomeArtista = buscarNomeArtistaPorId(artista.getFkArtista());
            logger.info("Ignorando inserção do LastFM para " + (nomeArtista != null ? nomeArtista : artista.getIdPlataforma()) + " pois a data já existe no banco.");
        }
    }

    public String normalizarNomeArtista(String nome) {
        if (nome == null || nome.trim().isEmpty()) return null;

        nome = nome.trim().toLowerCase();

        Map<String, String> mapaNormalizacao = Map.ofEntries(
                Map.entry("usher", "Usher"),
                Map.entry("zayn", "Zayn"),
                Map.entry("ne-yo", "Ne-Yo"),
                Map.entry("beyoncé", "Beyoncé")
        );

        return mapaNormalizacao.getOrDefault(nome, nome);
    }

    public Integer buscarIdArtistaPorNome(String nomeArtista) {
        String sql = "SELECT idArtista FROM Artista WHERE LOWER(nome) = LOWER(?)";
        try (Connection conn = DriverManager.getConnection(URL, USUARIO, SENHA);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, nomeArtista.trim());
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("idArtista");
            }
        } catch (SQLException e) {
            logger.severe("Erro ao buscar idArtista para " + nomeArtista + ": " + e.getMessage());
        }
        return null;
    }

    // Novo método para buscar o nome do artista pelo id
    public String buscarNomeArtistaPorId(int idArtista) {
        String sql = "SELECT nome FROM Artista WHERE idArtista = ?";
        try (Connection conn = DriverManager.getConnection(URL, USUARIO, SENHA);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idArtista);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("nome");
            }
        } catch (SQLException e) {
            logger.severe("Erro ao buscar nome do artista para id " + idArtista + ": " + e.getMessage());
        }
        return null;
    }

    public Date validarEConverterData(String dataStr) {
        if (dataStr == null || !dataStr.matches("\\d{2}/\\d{2}/\\d{4}")) {
            logger.warning("Data inválida detectada: " + dataStr);
            return null;
        }
        try {
            SimpleDateFormat formato = new SimpleDateFormat("dd/MM/yyyy");
            java.util.Date dataUtil = formato.parse(dataStr);
            return new Date(dataUtil.getTime());
        } catch (ParseException e) {
            logger.severe("Erro ao converter data: " + dataStr + " - " + e.getMessage());
            return null;
        }
    }
}
