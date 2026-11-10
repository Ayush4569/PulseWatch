# ⚡ PulseWatch — Real-Time Uptime & Incident Monitoring Platform
👉 [https://pulsewatch.dev](https://pulsewatch.dev)  

![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-%23DC382D.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-%23010101.svg?style=for-the-badge&logo=socketdotio&logoColor=white)

**PulseWatch** is a production-grade, distributed uptime and infrastructure monitoring platform engineered for developers and DevOps teams. It provides continuous HTTP/HTTPS health checks, sub-millisecond response latency tracking, autonomous incident detection, and real-time telemetry streaming via WebSockets — complemented by AI-powered executive health intelligence using Google Gemini.

Built from scratch with a focus on scalable distributed systems, PulseWatch decouples job scheduling, probe execution, real-time messaging, and analytical calculation across specialized worker queues and Redis pub/sub pipelines.

---

## 🚀 Features

- 📡 **High-Precision Endpoint Monitoring** — Configurable probe intervals (30s, 60s, 300s) with automated URL normalization and timeout guards.
- ⚡ **Real-Time WebSocket Telemetry** — Live health check stream pushing latency, response status, and timestamps directly to the client without polling.
- 🚨 **Autonomous Incident State Machine** — Detects downtime and consecutive probe failures, logs open incidents with root-cause error reasons, and auto-resolves when endpoints recover.
- 🧠 **AI Telemetry Intelligence** — Powered by the official Google Gemini SDK , synthesizing fleet uptime, latency degradation, and operational recommendations without hallucination.
- 👤 **Guest Mode (Zero-Friction Demo)** — Immediate 1-monitor sandbox access for unauthenticated visitors, with automatic data migration and history preservation upon signing up.
- 📊 **Interactive Latency & SLA Analytics** — Historical latency trend charting (1h, 6h, 24h, 3d), SLA percentage calculations, and paginated check audit logs.
- 🔄 **Distributed Background Workers** — BullMQ and Redis-backed queue system isolating probe execution from the HTTP API server.
- 🔐 **Production-Grade Authentication** — Dual-token JWT architecture (short-lived Access Tokens + rotating Refresh Tokens) stored in secure, HttpOnly, SameSite cookies.
- 🐳 **Containerized Deployment** — Multi-stage Docker configuration supporting unified single-process or distributed multi-container execution.

---

## 🧱 Tech Stack

| Layer | Technologies & Tools |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, TanStack Query (React Query), Socket.IO Client, Lucide Icons, Sonner |
| **Backend** | Node.js, Express, TypeScript , BullMQ, `pg` (PostgreSQL client with SSL pool), ioredis |
| **Database** | PostgreSQL (Relational schema, indexed time-series logs, foreign key constraints) |
| **Caching & Pub/Sub** | Redis (Distributed queues, job deduplication, multi-channel check broadcasting) |
| **AI Intelligence** | Google Gemini API (`@google/genai` SDK with structured JSON output enforcement) |
| **Authentication** | JWT (JSON Web Tokens) with cryptographic Refresh Token Rotation and Bcrypt |
| **Validation** | Zod (Request parsing, type coercion, and URL normalization) |
| **Infra & DevOps** | Docker (Multi-stage build), Docker Compose, Upstash Redis, Neon PostgreSQL |

---

## 🧠 System Design & Architecture Highlights

### 1. Decoupled Responsibilities & Job Queue Pipeline
PulseWatch enforces a strict separation of concerns across the monitoring lifecycle:
- **API Server:** Manages CRUD operations, monitor states, and client auth.
- **Scheduler:** Translates interval definitions into BullMQ repeat patterns.
- **Worker Pool:** Consumes queued probe jobs, executes isolated HTTP fetch requests, measures DNS/network latency, and records check results.
- **Raw Event Storage:** All pings are recorded in `monitor_checks` as an immutable time-series log from which uptime and SLA statistics are calculated.

```
 USER
  │ (URL + interval)
  ▼
API Server ──▶ Database (monitors table)
                 │
                 ▼
          BullMQ Scheduler (Redis)
                 │
                 ▼
           Worker Pool ──▶ Target Endpoint (HTTP Probe)
                 │
                 ▼
          Database (monitor_checks & incidents)
                 │
                 ▼
          Redis Pub/Sub ──▶ Socket.IO Server ──▶ Dashboard Client
```

### 2. Real-Time Telemetry Broadcasting (Pub/Sub)
Worker nodes publish completed check events directly into Redis Pub/Sub channels. The Socket.IO server layer subscribes to these channels and multiplexes events into authenticated, user-scoped rooms (`user:${userId}`). This ensures instant telemetry delivery without database polling overhead.

### 3. Autonomous Incident Lifecycle
Incidents are managed via a state-machine pattern:
- **Failure Trigger:** When an active monitor fails a check (non-200 code or network timeout), the engine inspects for existing open incidents. If none exist, it opens a new incident record with the exact failure reason.
- **Auto-Recovery:** As soon as an endpoint responds successfully with `200 OK`, any active incident is marked `RESOLVED` with a resolution timestamp.

### 4. AI-Grounded Reliability Synthesis
The AI summary engine queries user-specific telemetry data (mean response time, incident history, fleet uptime, and latency spikes exceeding $1.5\times$ average) and transmits the structured payload to Google Gemini (`gemini-2.5-flash`). Strict prompting and JSON schema enforcement ensure all returned key findings and recommendations are strictly grounded in actual metrics.

### 5. Guest Onboarding & Account Preservation Flow
Unauthenticated guests can test the platform with a 1-monitor limit enforced directly in PostgreSQL. When a guest decides to register, the backend upgrades the existing guest record in place (`is_guest = FALSE`), preserving all probe history, latency metrics, and incident logs seamlessly under their new permanent account.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/pulsewatch?sslmode=require
REDIS_URL=redis://default:password@host:6379
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_32_chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/PulseWatch.git
cd PulseWatch

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Run Database Migrations
```bash
cd backend
npm run migrate
```

### 3. Start Development Servers
```bash
# Terminal 1: Backend Server
cd backend && npm run dev

# Terminal 2: BullMQ Monitoring Worker
cd backend && npm run worker

# Terminal 3: Frontend Next.js Client
cd frontend && npm run dev
```

### 4. Run via Docker
```bash
docker-compose up --build
```

---

## 🧑‍💻 Author

> Built with ❤️ by **Ayush Mishra**  
> 🔗 [LinkedIn](https://www.linkedin.com/in/ayush-mishra-659951293)

---

## 🏷️ License

This project is open-source and available under the [MIT License](LICENSE).
