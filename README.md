# Real-Time Full-Stack Chat Engine with AI Moderation

A high-performance, real-time messaging platform built with **Spring Boot** and **React**.
This project demonstrates a production-grade serverless architecture on AWS, featuring secure WebSocket communication and automated AI-driven content moderation for local Indian languages and hate speech.


## Key Features
* **Real-Time Messaging:** Instant communication via Spring WebSocket (STOMP over SockJS).
* **AI Content Moderation:** Automated real-time scanning of messages for toxicity and harassment before persistence and broadcast.
* **Serverless Cloud Infrastructure:** Optimized for AWS using ECS Fargate, S3, and RDS.
* **Secure Stateless Auth:** Custom **JWT (JSON Web Token)** implementation securing both REST API endpoints and WebSocket handshakes.
* **Smart Sidebar:** Persistence layer for recent chat partners using `localStorage` caching and database synchronization.

## The Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, StompJS, SockJS |
| **Backend** | Java 21, Spring Boot 4.x, Spring Security, JPA/Hibernate |
| **AI Layer** | Moderation API (Gemini integration) |
| **Database** | PostgreSQL (Amazon RDS) |
| **Cloud/DevOps** | AWS ECS Fargate, Amazon ECR, Amazon S3, Docker |

---

## Architecture & DevOps Highlights

### 1. Cloud-Native Deployment (AWS)
The application utilizes a decoupled, highly-available architecture:
* **Amazon S3:** Hosts the React frontend as a static website.
* **AWS ECS Fargate:** Runs the containerized Spring Boot backend in a serverless environment (no EC2 management).
* **Amazon ECR:** Serves as the private registry for Docker image versioning.
* **VPC Networking:** Implemented strict Security Group rules to isolate the RDS instance, allowing traffic only from the Fargate service on port 5432.

### 2. AI Moderation Workflow
To ensure a safe user experience, the system implements a real-time moderation hook:
1. **Intercept:** The backend intercepts a WebSocket message frame.
2. **Scan:** The text is processed through an AI moderation service to calculate a "Toxicity Score."
3. **Filter:** Messages exceeding the safety threshold are blocked or replaced with a system warning, preventing them from being saved to **PostgreSQL** or broadcast to other users.

### 3. WebSocket Security (The "Interceptor" Pattern)
Standard Spring Security doesn't automatically protect WebSocket frames. This project implements a custom `ChannelInterceptor`:
* Validates the JWT in the STOMP `CONNECT` header.
* Manually populates the `UserAuthentication` context for the persistent connection.
* Restricts users to subscribing only to their private queues (`/user/queue/messages`).

  

---

## 🚦 Quick Start

### Prerequisites
* JDK 21+
* Node.js 18+
* Docker

### Local Setup
```bash
# Clone the repo
git clone [https://github.com/your-username/chat-app.git](https://github.com/your-username/chat-app.git)

# Start Backend
cd backend && ./mvnw spring-boot:run

# Start Frontend
cd frontend && npm install && npm run dev
```

## Screenshots

<img width="980" height="781" alt="image" src="https://github.com/user-attachments/assets/abc40750-36d3-47ca-b2e8-58f616a276f0" />
<img width="1097" height="706" alt="image" src="https://github.com/user-attachments/assets/24ed4b40-e142-4a8d-a0f1-ca26b82d06aa" />
<img width="1120" height="822" alt="image" src="https://github.com/user-attachments/assets/a24fd83a-efd4-498f-b5e2-8fea17204203" />


