# ===== build stage =====
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Gradle 래퍼 + 빌드 스크립트 먼저 복사 → 의존성 레이어 캐시
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon > /dev/null 2>&1 || true

# 소스 복사 후 jar 빌드 (테스트는 Docker 빌드 중 실행 안 함 → Testcontainers 불필요)
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# ===== run stage =====
FROM eclipse-temurin:21-jre AS run
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
# DB_URL, DB_USERNAME, DB_PASSWORD, CIPHER_JWT_SECRET, CIPHER_AES_KEY 등은 런타임 env 주입
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
