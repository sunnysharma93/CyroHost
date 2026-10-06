# Build the Spring Boot API. Tests run in Jenkins before this image is built.
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package \
    && mv "$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.original')" /src/app.jar

FROM eclipse-temurin:21-jre-jammy AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 cyro \
    && useradd --system --uid 10001 --gid cyro --home-dir /app --shell /usr/sbin/nologin cyro
WORKDIR /app
COPY --from=build --chown=cyro:cyro /src/app.jar /app/app.jar
USER cyro
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/urandom"
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=10 \
    CMD curl -fsS http://127.0.0.1:8080/actuator/health/readiness || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
