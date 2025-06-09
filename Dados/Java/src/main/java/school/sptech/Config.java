package school.sptech;

import java.io.InputStream;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Config {

    private static final Properties props = new Properties();

    static {
        try (InputStream input = Config.class.getClassLoader().getResourceAsStream("config.properties")) {
            props.load(input);

            // Substitui placeholders do tipo ${VARIAVEL} por System.getenv("VARIAVEL")
            for (String name : props.stringPropertyNames()) {
                String value = props.getProperty(name);
                props.setProperty(name, resolveEnvPlaceholders(value));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String get(String chave) {
        return props.getProperty(chave);
    }

    private static String resolveEnvPlaceholders(String value) {
        Pattern pattern = Pattern.compile("\\$\\{(.+?)\\}");
        Matcher matcher = pattern.matcher(value);
        StringBuffer resolved = new StringBuffer();

        while (matcher.find()) {
            String envVar = matcher.group(1);
            String replacement = System.getenv(envVar);
            if (replacement == null) replacement = ""; // ou manter original: matcher.group(0)
            matcher.appendReplacement(resolved, Matcher.quoteReplacement(replacement));
        }

        matcher.appendTail(resolved);
        return resolved.toString();
    }
}
