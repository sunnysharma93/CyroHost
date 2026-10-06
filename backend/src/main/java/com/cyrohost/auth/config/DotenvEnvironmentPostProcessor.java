package com.cyrohost.auth.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;

/**
 * Loads backend/.env before application.yml placeholders are resolved.
 * Existing environment variables and system properties are left in place.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    static final String PROPERTY_SOURCE_NAME = "backendDotenv";

    private final Log log;

    public DotenvEnvironmentPostProcessor(DeferredLogFactory logFactory) {
        this.log = logFactory.getLog(DotenvEnvironmentPostProcessor.class);
    }

    @Override
    public int getOrder() {
        // Earlier than ConfigDataEnvironmentPostProcessor so ${DB_URL} is visible.
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path file = resolveEnvFile(Path.of(System.getProperty("user.dir", ".")));
        if (file == null) {
            return;
        }
        Map<String, String> parsed;
        try {
            parsed = parse(Files.readString(file, StandardCharsets.UTF_8));
        } catch (IOException ex) {
            throw new IllegalStateException("Could not read " + file.toAbsolutePath(), ex);
        }
        Map<String, Object> selected = new LinkedHashMap<>();
        int skipped = 0;
        for (Map.Entry<String, String> entry : parsed.entrySet()) {
            if (alreadyDefined(environment, entry.getKey())) {
                skipped++;
                continue;
            }
            selected.put(entry.getKey(), entry.getValue());
        }
        if (!selected.isEmpty()) {
            environment.getPropertySources().addLast(new MapPropertySource(PROPERTY_SOURCE_NAME, selected));
        }
        log.info("Loaded " + selected.size() + " variables from " + file.toAbsolutePath()
                + " (" + skipped + " already set)");
    }

    static Path resolveEnvFile(Path workingDirectory) {
        Path fromRepositoryRoot = workingDirectory.resolve("backend").resolve(".env");
        if (Files.isRegularFile(fromRepositoryRoot)) {
            return fromRepositoryRoot;
        }
        Path fileName = workingDirectory.getFileName();
        if (fileName != null && "backend".equals(fileName.toString())) {
            Path local = workingDirectory.resolve(".env");
            if (Files.isRegularFile(local)) {
                return local;
            }
        }
        return null;
    }

    static Map<String, String> parse(String contents) {
        String text = contents.startsWith("\uFEFF") ? contents.substring(1) : contents;
        Map<String, String> values = new LinkedHashMap<>();
        for (String rawLine : text.split("\\R")) {
            String line = rawLine.trim();
            if (line.isEmpty() || line.startsWith("#")) {
                continue;
            }
            if (line.startsWith("export ")) {
                line = line.substring("export ".length()).trim();
            }
            int separator = line.indexOf('=');
            if (separator <= 0) {
                continue;
            }
            String key = line.substring(0, separator).trim();
            if (!key.matches("[A-Za-z_][A-Za-z0-9_]*")) {
                continue;
            }
            values.put(key, unquote(line.substring(separator + 1)));
        }
        return values;
    }

    private static String unquote(String raw) {
        String value = raw.trim();
        if (value.length() >= 2) {
            char quote = value.charAt(0);
            if ((quote == '"' || quote == '\'') && value.charAt(value.length() - 1) == quote) {
                String inner = value.substring(1, value.length() - 1);
                if (quote == '"') {
                    return inner.replace("\\n", "\n").replace("\\r", "\r").replace("\\\"", "\"").replace("\\\\", "\\");
                }
                return inner;
            }
        }
        int comment = -1;
        for (int i = 0; i < value.length() - 1; i++) {
            if (Character.isWhitespace(value.charAt(i)) && value.charAt(i + 1) == '#') {
                comment = i;
                break;
            }
        }
        if (comment >= 0) {
            value = value.substring(0, comment);
        }
        return value.trim();
    }

    private static boolean alreadyDefined(ConfigurableEnvironment environment, String key) {
        if (System.getenv(key) != null || System.getProperty(key) != null) {
            return true;
        }
        for (PropertySource<?> source : environment.getPropertySources()) {
            String name = source.getName();
            if (name == null) {
                continue;
            }
            boolean higherPriority = "commandLineArgs".equals(name)
                    || name.startsWith("systemProperties")
                    || name.startsWith("systemEnvironment");
            if (higherPriority && source.containsProperty(key)) {
                return true;
            }
        }
        return false;
    }
}
