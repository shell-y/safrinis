package school.sptech;

import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.logging.Logger;

public class S3Downloader {

    // Alterado para pegar o nome da classe dinamicamente
    private static final Logger logger = LoggerUtil.setupLogger("S3Downloader", false);

    private final S3Client s3;

    public S3Downloader() {
        AwsSessionCredentials awsCreds = AwsSessionCredentials.create(
                Config.get("aws.access_key_id"),
                Config.get("aws.secret_access_key"),
                Config.get("aws.session_token")
        );

        this.s3 = S3Client.builder()
                .region(Region.of(Config.get("aws.region")))
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                .build();
    }

    public void baixarArquivo(String bucket, String chaveObjeto, String caminhoDestino) {
        try {
            logger.info(String.format("Iniciando download de '%s' do bucket '%s' para '%s'",
                     chaveObjeto, bucket, caminhoDestino));

            var destinationPath = Paths.get(caminhoDestino);
            var parentDir = destinationPath.getParent();
            if (parentDir != null && !Files.exists(parentDir)) {
                Files.createDirectories(parentDir);
                logger.info("Diretório criado: " + parentDir);
            }

            Files.deleteIfExists(destinationPath);

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(chaveObjeto)
                    .build();

            s3.getObject(getObjectRequest, ResponseTransformer.toFile(destinationPath));
            logger.info("Download concluído com sucesso.");

        } catch (Exception e) {
            logger.severe("Erro ao baixar arquivo do S3: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void baixarArquivoLM(String bucket, String chaveObjeto, String caminhoDestino) {
        try {
            logger.info(String.format("Iniciando download de '%s' do bucket '%s' para '%s'",
                     chaveObjeto, bucket, caminhoDestino));

            var destinationPath = Paths.get(caminhoDestino);
            var parentDir = destinationPath.getParent();
            if (parentDir != null && !Files.exists(parentDir)) {
                Files.createDirectories(parentDir);
                logger.info("Diretório criado: " + parentDir);
            }

            Files.deleteIfExists(destinationPath);

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(chaveObjeto)
                    .build();

            s3.getObject(getObjectRequest, ResponseTransformer.toFile(destinationPath));
            logger.info("Download concluído com sucesso.");

        } catch (Exception e) {
            logger.severe("Erro ao baixar arquivo do S3: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void fechar() {
        s3.close();
    }
}
