<p align="center">
  <img src="/readme-assets/TCI-Logo.png" alt="TCI Logo" width="300" />
</p>

# TCI (Transit Commerce Intelligence)

An AI-powered WebGIS platform for economic insight and property investment potential around mass transportation hubs in Indonesia. Built for the [MAPID WebGIS Competition, Mass Transportation Edition, 2026](https://mapid.co.id/competition).

> **For full product details** (problem statement, data sources, AI models, spatial analysis methods, features, and roadmap), see [PRD.md](./PRD.md).

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Leaflet.js / MapLibre GL JS, Turf.js
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL + PostGIS (Supabase)
- **AI:** Prophet, K-Means, Random Forest, Decision Tree, Gemini LLM API
- **Deployment:** Vercel

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

## Project Structure

```
TCI/
├── frontend/              # React + TypeScript + Vite
│   └── src/
├── backend/               # Node.js + Express
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── services/
│       │   └── ai/
│       ├── middlewares/
│       └── utils/
└── readme-assets/
```

## Getting Started

### Without Docker

#### Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in Supabase URL, anon key, Gemini API key, etc.
npx nodemon src/index.js
```

#### Frontend

```bash
cd frontend
npm install
npm run dev               # dev server at localhost:5173
npm run build             # production build
npm run preview           # preview production build
```

### With Docker

#### Prerequisites

- [Docker](https://www.docker.com/) v20.10+
- [Docker Compose](https://docs.docker.com/compose/) v2+

#### Development

```bash
# Clone repository
git clone https://github.com/bit-loi/TCI.git
cd TCI

# Create backend .env file
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase URL, anon key, Gemini API key, etc.

# Build and start all services (hot-reload enabled)
docker compose up --build
```

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React + Vite dev server (hot-reload) |
| Backend | http://localhost:3000 | Express API server (nodemon hot-reload) |

#### Production

```bash
# Build and start production services
docker compose -f docker-compose.prod.yml up --build -d
```

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:80 | Nginx + static build |
| Backend | http://localhost:3000 | Node.js (production mode) |

#### Common Commands

```bash
# Start in background
docker compose up --build -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Rebuild after dependency changes
docker compose up --build

# Production build
docker compose -f docker-compose.prod.yml up --build -d

# Production down
docker compose -f docker-compose.prod.yml down
```

#### Environment Variables

**Frontend** (passed via shell or `.env`):
- `VITE_CARTO_API_KEY` — CARTO basemap API key

**Backend** (via `backend/.env`):
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- `GEMINI_API_KEY` — Google Gemini API key
- `PORT` — Server port (default: 3000)

## Team

| Name | MAPID Username |
|---|---|
| Abraham Gregorius Anderson Thio | grgsxx |
| Axel Sanjiro Yang | axel |
| Jason Brandon Loi | bloi |
| Stanislaus Alva Jufinto | stnslv |
| Vallerie Anne Jose | annejosss |

## License

Project documentation & analysis are intended for the MAPID WebGIS Competition, Mass Transportation Edition, 2026. Raw MAPID data must not be redistributed outside the competition per competition data terms.
