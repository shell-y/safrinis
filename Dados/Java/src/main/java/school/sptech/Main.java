package school.sptech;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.*;
import java.util.logging.Logger;
import school.sptech.artistas.ArtistaSpotify;
import school.sptech.artistas.ArtistaLastFM;

public class Main {

    private static final Logger logger = LoggerUtil.setupLogger(Main.class.getSimpleName(), true);

    public static void main(String[] args) {
        String bucket = Config.get("aws.bucket");
        String chaveObjetoSpotify = Config.get("aws.chave_objeto");
        String chaveObjetoLastFM = Config.get("aws.chave_objeto2");
        String pastaTemp = Config.get("aws.tempPath");

        String caminhoArquivoSpotify = Paths.get(pastaTemp, chaveObjetoSpotify).toString();
        String caminhoArquivoLastFM = Paths.get(pastaTemp, chaveObjetoLastFM).toString();

        File pasta = new File(pastaTemp);
        if (!pasta.exists() && !pasta.mkdirs()) {
            logger.severe("Falha ao criar a pasta temporária: " + pastaTemp);
            return;
        }

        S3Downloader downloader = new S3Downloader();
        downloader.baixarArquivo(bucket, chaveObjetoSpotify, caminhoArquivoSpotify);
        downloader.baixarArquivo(bucket, chaveObjetoLastFM, caminhoArquivoLastFM);
        downloader.fechar();

        ArtistaDAO dao = new ArtistaDAO();

        if (dao.dadosJaForamInseridosHoje("Spotify", "dtRequisicao")) {
            logger.info("O processo foi encerrado. Dados do Spotify já foram inseridos hoje.");
            return;
        }

        if (dao.dadosJaForamInseridosHoje("LastFm", "dataColeta")) {
            logger.info("O processo foi encerrado. Dados do LastFM já foram inseridos hoje.");
            return;
        }

        // Spotify
        try (FileInputStream fis = new FileInputStream(caminhoArquivoSpotify);
             Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet planilha = workbook.getSheetAt(0);
            Iterator<Row> linhas = planilha.iterator();
            if (linhas.hasNext()) linhas.next(); // cabeçalho

            while (linhas.hasNext()) {
                Row linha = linhas.next();
                String nomeArtista = getString(linha.getCell(1));

                try {
                    dao.salvarNomeArtista(nomeArtista);
                } catch (Exception e) {
                    logger.severe("Erro ao salvar artista na tabela Artista: " + e.getMessage());
                }

                String nomeNormalizado = dao.normalizarNomeArtista(nomeArtista);
                Integer idArtista = dao.buscarIdArtistaPorNome(nomeNormalizado);

                if (idArtista == null) {
                    logger.warning("Artista não encontrado no banco: " + nomeNormalizado);
                    continue;
                }

                Date ultimaData = dao.buscarUltimaData("Spotify", "dtRequisicao", idArtista);
                Date dataExcel = dao.validarEConverterData(getString(linha.getCell(4)));

                if (ultimaData != null && dataExcel != null && !dataExcel.after(ultimaData)) {
                    logger.info("Artista Spotify já foi inserido hoje: " + nomeNormalizado);
                    continue;
                }

                ArtistaSpotify artista = new ArtistaSpotify();
                artista.setIdentificadorSpotify(getString(linha.getCell(0)));
                artista.setPopularidade((int) getNumeric(linha.getCell(2)));
                artista.setSeguidores((int) getNumeric(linha.getCell(3)));
                artista.setDtRequisicao(getString(linha.getCell(4)));
                artista.setFkArtista(idArtista);

                dao.salvarArtistaSpotify(artista);
            }
        } catch (IOException e) {
            logger.severe("Erro ao ler o arquivo Excel (Spotify): " + e.getMessage());
        } catch (Exception e) {
            logger.severe("Erro ao processar arquivo Spotify: " + e.getMessage());
        }

        // LastFM
        try (FileInputStream fis = new FileInputStream(caminhoArquivoLastFM);
             Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet planilha = workbook.getSheetAt(0);
            Iterator<Row> linhas = planilha.iterator();
            if (linhas.hasNext()) linhas.next(); // cabeçalho

            while (linhas.hasNext()) {
                Row linha = linhas.next();
                String nomeArtista = getString(linha.getCell(1)).trim();
                String nomeNormalizado = dao.normalizarNomeArtista(nomeArtista);
                Integer idArtista = dao.buscarIdArtistaPorNome(nomeNormalizado);

                if (idArtista == null) {
                    logger.warning("Artista não encontrado no banco: " + nomeNormalizado);
                    continue;
                }

                Date ultimaData = dao.buscarUltimaData("LastFm", "dataColeta", idArtista);
                Date dataExcel = dao.validarEConverterData(getString(linha.getCell(6)));

                if (ultimaData != null && dataExcel != null && !dataExcel.after(ultimaData)) {
                    logger.info("Artista LastFM já foi inserido hoje: " + nomeNormalizado);
                    continue;
                }

                ArtistaLastFM artista = new ArtistaLastFM();
                artista.setIdPlataforma(getString(linha.getCell(0)));
                artista.setDataColeta(getString(linha.getCell(6)));
                artista.setOuvintes((int) getNumeric(linha.getCell(2)));
                artista.setPlays((int) getNumeric(linha.getCell(3)));
                artista.setTotalPlays((int) getNumeric(linha.getCell(4)));
                artista.setOnTour((int) getNumeric(linha.getCell(5)));
                artista.setFkArtista(idArtista);

                dao.salvarArtistaLastFM(artista);
            }
        } catch (IOException e) {
            logger.severe("Erro ao ler o arquivo Excel (LastFM): " + e.getMessage());
        } catch (Exception e) {
            logger.severe("Erro ao processar arquivo LastFM: " + e.getMessage());
        }

        AtualizaFK atualizadorFK = new AtualizaFK();
        atualizadorFK.atualizarFK();

        logger.info("Atualização de FKs concluída.");
    }

    private static String getString(Cell cell) {
        return (cell != null) ? cell.toString().trim() : "";
    }

    private static double getNumeric(Cell cell) {
        return (cell != null && cell.getCellType() == CellType.NUMERIC) ? cell.getNumericCellValue() : 0;
    }
}
