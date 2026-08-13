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

### Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in Supabase URL, anon key, Gemini API key, etc.
npx nodemon src/index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # dev server at localhost:5173
npm run build             # production build
npm run preview           # preview production build
```

## Team

| Name | MAPID Username |
|---|---|
| Abraham Gregorius Anderson Thio | grgsxx |
| Axel Sanjiro Yang | axel |
| Jason Brandon Loi | bloi |
| Stanislaus Alva Jufinto | stnslv |
| Vallerie Anne Jose | annejosss |

## License

Project documentation and analysis are intended for the MAPID WebGIS Competition, Mass Transportation Edition, 2026. Raw MAPID data must not be redistributed outside the competition per competition data terms.
