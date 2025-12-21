# Stage 1: Build the application (Using Maven with Java 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# Run Maven build specifically inside the backend folder
RUN mvn -f backend/chatRoom/pom.xml clean package -DskipTests

# Stage 2: Run the application (Using JRE 21)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy the built jar from Stage 1
COPY --from=build /app/backend/chatRoom/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]