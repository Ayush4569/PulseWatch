# ⚡ PulseWatch

**A real-time uptime and incident monitoring platform. Track HTTP/HTTPS endpoints, monitor latency, detect downtime, and receive AI-generated incident reports.**

🔗 **Live Demo:** [https://pulse-watch-hq.vercel.app](https://pulse-watch-hq.vercel.app)

![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-%23DC382D.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-%23010101.svg?style=for-the-badge&logo=socketdotio&logoColor=white)

---

## 🚀 Features

- 📡 **Configurable Health Checks:** Monitor any HTTP/HTTPS endpoint at intervals of 30s, 60s, or 300s with built-in request timeouts.
- ⚡ **Real-Time Live Updates:** Every check result is pushed instantly to the frontend dashboard over WebSockets via Redis Pub/Sub without polling.
- 🚨 **Automatic Incident Management:** Detects non-200 responses or network timeouts, opens an incident record, and automatically resolves it once the service recovers.
- 📊 **Metrics & Analytics:** Interactive charts for response times (1h, 6h, 24h, 3d), uptime percentage calculations, and historical check logs.
- 🧠 **AI-Powered Diagnostics:** Google Gemini analyzes metrics and response trends to generate concise health summaries and actionable recommendations.
- 👤 **Guest Mode & Auth:** Immediate trial with 1 monitor without signing up (seamlessly preserved on account upgrade), with JWT authentication and rotating refresh tokens in HttpOnly cookies.
- 🐳 **Docker-Ready:** Complete multi-stage Docker build and Docker Compose configuration for one-command local orchestration.

---

## 🧩 Architecture

```mermaid
graph TD
    Dashboard[Next.js Dashboard] <-->|REST API & WebSockets| Server[Express API Server]
    Server -->|Store Monitors & Auth| DB[(PostgreSQL)]
    Server -->|Schedule Checks| Redis[(Redis Queue & Pub/Sub)]
    Redis -->|Dispatch Jobs| Worker[BullMQ Worker]
    Worker -->|HTTP Ping| Target([Target Endpoint])
    Worker -->|Save Results & Incidents| DB
    Worker -->|Publish Live Event| Redis
    Redis -->|Forward Message| Server
```

### System Components

| Component | Responsibility |
|---|---|
| **Frontend (`Next.js 15`)** | Dashboard displaying real-time response charts, incident logs, and monitor cards. |
| **API Server (`Express`)** | Handles user authentication, monitor CRUD, metrics calculation, and Socket.IO connections. |
| **Worker (`BullMQ`)** | Autonomous background process that executes scheduled pings and measures latency. |
| **PostgreSQL** | Primary relational datastore for users, monitor configurations, check history, and incidents. |
| **Redis** | Centralized broker for BullMQ job scheduling and real-time Pub/Sub WebSocket broadcasts. |
| **Google Gemini** | Analyzes historical uptime data and latency anomalies to generate diagnostic summaries. |

---

## 🧱 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, TanStack Query, Socket.IO Client, Lucide Icons |
| **Backend** | Node.js (v22), Express 5, TypeScript, BullMQ, `pg` (PostgreSQL client), ioredis, Socket.IO |
| **Database & Queue** | PostgreSQL, Redis |
| **AI Integration** | Google Gemini API (`@google/genai`) |
| **Authentication** | JWT with HttpOnly cookie rotation, Bcrypt, Zod validation |
| **DevOps** | Docker, Docker Compose, Multi-stage builds |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Auth Secrets
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_32_chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Database & Cache (Use local or cloud URLs like Neon / Upstash)
DATABASE_URL=postgresql://pulseuser:pulsepassword@postgres:5432/pulsewatch
REDIS_URL=redis://redis:6379

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
PRIMARY_GEMINI_MODEL=gemini-2.5-flash
SECONDARY_GEMINI_MODEL=gemini-2.5-pro
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

---

## 🏃 Running Locally

### Option A: Using Docker Compose (Fastest & Recommended)

Run the published backend container alongside isolated local PostgreSQL and Redis services—no Node, Postgres, or Redis installation required on your host machine.

#### 1. Clone the repository
```bash
git clone https://github.com/Ayush4569/PulseWatch.git
cd PulseWatch
```

#### 2. Configure backend environment
Create `backend/.env` with your settings (remember to add your `GEMINI_API_KEY`):
```bash
cp backend/.env.example backend/.env   # or create backend/.env using the template above
```

#### 3. Run migrations & start backend stack
```bash
# Pull the latest published image from Docker Hub
docker compose pull backend

# Run database migrations to set up the schema
docker compose run --rm backend node dist/db/migrate.js

# Start backend, postgres, and redis in the background
docker compose up -d
```

#### 4. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will be live at `http://localhost:3000` and the backend API at `http://localhost:8000`.

To view backend logs or stop containers:
```bash
docker compose logs -f backend   # Follow backend logs
docker compose down              # Stop all containers
```

---

### Option B: Running from Source (Manual Setup)

If you prefer running all services directly with Node.js on your machine:

#### 1. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

#### 2. Run database migrations
Ensure your PostgreSQL and Redis instances are running and configured in `backend/.env`:
```bash
cd backend
npm run migrate
```

#### 3. Start development servers
```bash
# Terminal 1: API & WebSocket server
cd backend && npm run dev

# Terminal 2: Health check worker (required for active pinging)
cd backend && npm run worker

# Terminal 3: Frontend dashboard
cd frontend && npm run dev
```

---

## 🧑‍💻 Author

Built by **Ayush Mishra**  
🔗 [LinkedIn](https://www.linkedin.com/in/ayush-mishra-659951293)

---

## 🏷️ License

This project is open source under the [MIT License](LICENSE).
