# Real-Time Spring Boot & React Chat Application

A full-stack, real-time chat application built with **Spring Boot (WebSocket)** and **React**. Features include global broadcasting, private 1-on-1 messaging, JWT authentication, and persistent message history.

## Features

* **Real-Time Messaging:** Instant communication using WebSocket (StompJS & SockJS).
* **Global & Private Chat:** Support for public rooms (`/topic/messages`) and private DMs (`/user/queue/messages`).
* **Secure Authentication:** Custom **JWT (JSON Web Token)** implementation securing both HTTP API endpoints and WebSocket connections.
* **Persistent History:** Messages are saved in the database and loaded on connection.
* **Smart Sidebar:**
    * Auto-discovery of recent chat partners.
    * Persistent contact list (via LocalStorage) for a seamless UX across reloads.
* **Typing Indicators:** Real-time visual feedback when a user is typing.
* **Responsive UI:** Clean, modern interface built with Tailwind CSS.

## Tech Stack

### Backend (Spring Boot)
* **Core:** Java 17+, Spring Boot 3.x
* **Communication:** Spring WebSocket (STOMP), Spring Messaging
* **Security:** Spring Security, JWT (JJWT)
* **Database:** Spring Data JPA (Hibernate) with MySQL/PostgreSQL (or H2)
* **Tools:** Lombok, Maven/Gradle

### Frontend (React)
* **Core:** React.js (Vite)
* **Styling:** Tailwind CSS
* **Real-Time:** SockJS-client, StompJS
* **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`)

---

## Installation & Setup

### 1. Backend Setup
1.  Clone the repository.
2.  Navigate to the backend folder.
3.  Configure your database in `src/main/resources/application.properties`.
4.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
5.  The server will start on `http://localhost:8080`.

### 2. Frontend Setup
1.  Navigate to the frontend folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` (or your Vite port) in the browser.

---

##  Architecture Highlights

### WebSocket Security (The "Interceptor" Pattern)
Unlike standard HTTP requests, WebSockets maintain a persistent connection. To secure this:
1.  The client sends the JWT via the STOMP `CONNECT` header.
2.  A custom `ChannelInterceptor` in Spring intercepts the initial connect frame.
3.  It validates the JWT, extracts the username, and manually sets the `UserAuthentication` context for that WebSocket session.
4.  This ensures that `User A` can only subscribe to their own private queue (`/user/queue/messages`).

### Sidebar Persistence strategy
* **Message History:** Fetched from the database API on load to populate previous conversations.
* **Recent Contacts:** Cached in the browser's `localStorage` (scoped by username) to ensure the active contact list remains stable even if the browser is refreshed or internet is lost.

---

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
