# TCI — Implementation Plan
## Pure-JS ML + Gemini API Integration

**Date:** 11 September 2026
**Stack:** Node.js (Express) + React + TensorFlow.js + Gemini API
**Constraint:** No Python, no new Docker services, existing docker-compose unchanged

---

## 1. Overview

This plan adds AI/ML capabilities to the existing TCI platform using only JavaScript runtimes and external APIs. All ML operations run server-side in Node.js or client-side in the browser. No new containers or infrastructure are added.

### What Gets Built

| Component | Location | Description |
|-----------|----------|-------------|
| Synthetic data engine | `backend/src/services/syntheticData.js` | Generates station features + 36-month time series from seed |
| Clustering service | `backend/src/services/ai/clustering.service.js` | TF.js KMeans → cluster ID + typology label |
| Scoring service | `backend/src/services/ai/scoring.service.js` | Deterministic weighted formula → investment score 0–100 |
| Forecasting service | `backend/src/services/ai/forecasting.service.js` | Exponential smoothing → 3-month predictions |
| Classification service | `backend/src/services/ai/classification.service.js` | Rule-based → business category recommendation |
| LLM service | `backend/src/services/ai/llm.service.js` | Gemini API → narrative insights |
| Station API routes | `backend/src/routes/station.routes.js` | REST endpoints for all ML outputs |
| Station data hook | `frontend/src/hooks/useStations.ts` | React hook to fetch + cache station data |
| Frontend integration | `frontend/src/pages/*.tsx` | Wire existing pages to API |

### What Already Works (No Changes)

- `EkonomiKawasan.tsx` — Overpass API POI fetching is real data, not ML
- Auth flow (Supabase)
- Docker compose setup
- Layout, routing, middleware

---

## 2. Synthetic Data Engine

**File:** `backend/src/services/syntheticData.js`

### Station Base Data

The 84 stations from `frontend/src/data/krl_stations.tsx` are ported to the backend as a static array (`KRL_STATIONS`). No external file reads — the data lives in code.

### Derived Features (per station, deterministic via seed)

| Feature | Derivation | Range |
|---------|-----------|-------|
| `connectivity` | Number of lines at station | 1–4 |
| `isHub` | true if connectivity >= 2 | boolean |
| `centrality` | Inverse distance to centroid of all stations | 0–1 |
| `passengerBase` | Seeded random 50k–200k daily pax | integer |
| `growthRate` | Seeded random 0.01–0.12 YoY | float |
| `businessDensity` | `5 + round(125 * activity + 35 * centrality + 18 * hub)` | integer |
| `propertyAvailability` | `clamp(0.70 - 0.35*centrality + 0.12*(1-activity), 0.08, 0.95)` | 0–1 |
| `intermodalIndex` | `clamp(0.20 + 0.35*hub + 0.23*min(connections/3, 1), 0.05, 0.98)` | 0–1 |
| `rentalIndex` | `32 + 85*centrality + 35*activity` (thousand Rp/m²/mo) | integer |

### Time Series Generation (36 months: 2023-01 to 2025-12)

For each station, generate monthly passenger volume:
```
volume[t] = base * (1 + trend)^t * seasonality[t] + noise
```
- `trend` = `growthRate / 12` per month
- `seasonality` = sinusoidal pattern (Jan/Feb low, Apr/May high)
- `noise` = small seeded Gaussian noise

### Output

```js
// Module export shape
{
  stations: StationData[],     // 84 stations with all derived features
  timeSeries: TimeSeriesRow[] // 84 * 36 = 3024 rows: { stationId, period, volume }
}
```

### Seed

Use seed `20260911` (matching the Python generator) for reproducibility.

---

## 3. ML Services

### 3.1 Clustering — TF.js KMeans

**File:** `backend/src/services/ai/clustering.service.js`

**Input features (normalized 0–1):**
- `connectivity_normalized`
- `centrality`
- `isHub` (0/1)
- `passengerBase_normalized`

**Method:**
1. Initialize TF.js `tf.data.array(features)`
2. Train `tf.train.kMeansClustering(4)` (k=4 clusters)
3. Assign each station to nearest centroid
4. Label clusters based on centroid characteristics:
   - Highest centrality + connectivity → `"Hub Aktivitas Tinggi"`
   - High connectivity, moderate centrality → `"Koridor Komuter Utama"`
   - Low centrality, high connectivity → `"Stasiun Transisi"`
   - Lowest overall → `"Aktivitas Lokal"`

**Output:** `{ [stationId]: { clusterId: 0-3, label: string } }`

### 3.2 Scoring — Deterministic Weighted Formula

**File:** `backend/src/services/ai/scoring.service.js`

Replicate the formula from the Python generator (which is already deterministic):

```
score = clamp(100 * (
  0.26 * passenger_relative +
  0.12 * growth_normalized +
  0.17 * pedestrian_access +
  0.14 * min(business_density / 175, 1) +
  0.15 * property_availability +
  0.16 * intermodal
) + noise, 8, 97)
```

All inputs come from `syntheticData.js` features. No ML — pure formula.

**Score breakdown components:**
```js
{
  passengerScore:   // normalized passenger volume * 26
  growthScore:      // normalized growth rate * 12
  accessibilityScore: // pedestrian_access * 17
  businessScore:    // min(business_density/175, 1) * 14
  propertyScore:    // property_availability * 15
  intermodalScore:  // intermodal * 16
  total: score
}
```

Rank stations by score descending (1 = highest).

**Output:** `{ [stationId]: { score, rank, breakdown } }`

### 3.3 Forecasting — Exponential Smoothing

**File:** `backend/src/services/ai/forecasting.service.js`

**Method:** Simple Exponential Smoothing (SES)

For each station's 36-month time series:
1. Split: train on months 1–24, validate on months 25–36
2. Find optimal `alpha` (0.1–0.9) by minimizing MAE on validation set
3. Retrain on full 36 months with best `alpha`
4. Predict next 3 periods: 2026-01, 2026-02, 2026-03

**Output:** `{ [stationId]: { forecast: [{ period, predicted }, ...], holdoutMAE } }`

**Horizon:** 3 months (as specified in PRD — limited data makes longer horizons unreliable)

### 3.4 Classification — Rule-Based Business Recommendation

**File:** `backend/src/services/ai/classification.service.js`

Map each station to a recommended business category based on its cluster + features:

| Condition | Category | Rationale |
|-----------|----------|-----------|
| `clusterId === 0` (Hub) | `"Makanan"` | High foot traffic, office presence |
| `clusterId === 1` (Koridor) + high residential | `"Minuman"` | Commuter morning/evening drinks |
| `clusterId === 2` (Transisi) + high education index | `"Toko Buku"` | Student foot traffic near campuses |
| `clusterId === 3` (Lokal) | `"Hobi"` | Local community interests |
| Default | `"Lainnya"` | General retail |

**Confidence:** Based on distance to cluster centroid for that category dimension.

**Output:** `{ [stationId]: { category, confidence, bufferRadiusSuggestion } }`

### 3.5 LLM — Gemini API

**File:** `backend/src/services/ai/llm.service.js`

**Package:** `@google/generative-ai`

**System prompt (Indonesian):**
```
Anda adalah asisten analisis transit. Hanya ringkas fakta yang diberikan.
Semua data adalah prototipe sintetis, bukan observasi lapangan.
Tidak memberikan saran investasi, perizinan, atau hukum.
Jawaban wajib mencakup batasan data ini.
```

**Per-station insight prompt includes:**
- Station name, lines, cluster label
- Score, rank, growth rate
- Top 3 forecast values
- Business recommendation + confidence
- Allowed claims list

**Fallback:** If Gemini API fails/ unavailable, return a deterministic template string.

**Output:** `{ text: string, source_run_id: string }`

---

## 4. API Routes

**File:** `backend/src/routes/station.routes.js`

All endpoints under `/api/stations`.

### `GET /api/stations`

Returns all 84 stations with computed ML fields.

**Response:**
```json
{
  "data": [
    {
      "id": "jakartakota",
      "name": "Jakarta Kota",
      "coord": [-6.1376, 106.8136],
      "lines": ["Bogor", "Tanjung Priok"],
      "score": 82.4,
      "rank": 1,
      "typology": { "clusterId": 0, "label": "Hub Aktivitas Tinggi" },
      "growth": { "historical_yoy_pct": 6.36, "forecast_3m_pct": 1.8 },
      "data_status": "synthetic_prototype"
    }
  ],
  "meta": { "total": 84, "generated_at": "..." }
}
```

### `GET /api/stations/typologies`

Returns cluster profiles.

**Response:**
```json
{
  "data": [
    {
      "clusterId": 0,
      "label": "Hub Aktivitas Tinggi",
      "stationCount": 12,
      "characteristics": ["Konektivitas tinggi", "Centrality tinggi", "Multi-line"]
    }
  ]
}
```

### `GET /api/stations/:id`

Single station full detail.

**Response:**
```json
{
  "data": {
    "id": "jakartakota",
    "name": "Jakarta Kota",
    "coord": [-6.1376, 106.8136],
    "lines": ["Bogor", "Tanjung Priok"],
    "score": 82.4,
    "rank": 1,
    "typology": { "clusterId": 0, "label": "Hub Aktivitas Tinggi" },
    "growth": { "historical_yoy_pct": 6.36, "forecast_3m_pct": 1.8 },
    "scoreBreakdown": {
      "passengerScore": 26.0,
      "growthScore": 7.2,
      "accessibilityScore": 14.5,
      "businessScore": 11.2,
      "propertyScore": 10.8,
      "intermodalScore": 12.7
    },
    "recommendation": {
      "category": "Makanan",
      "confidence": 0.74,
      "bufferRadiusSuggestion": 750
    },
    "data_status": "synthetic_prototype"
  }
}
```

### `GET /api/stations/:id/forecast`

Historical time series + 3-month forecast.

**Response:**
```json
{
  "data": {
    "stationId": "jakartakota",
    "historical": [
      { "period": "2023-01", "passengers": 4120000 },
      ...
      { "period": "2025-12", "passengers": 4870000 }
    ],
    "forecast": [
      { "period": "2026-01", "predicted_passengers": 4910000 },
      { "period": "2026-02", "predicted_passengers": 4950000 },
      { "period": "2026-03", "predicted_passengers": 4990000 }
    ],
    "holdoutMAE": 42000,
    "holdoutMAPE": 0.0092
  }
}
```

### `GET /api/stations/:id/insight`

LLM-generated narrative.

**Response:**
```json
{
  "data": {
    "stationId": "jakartakota",
    "text": "Stasiun Jakarta Kota memiliki skor investasi 82.4...",
    "source_run_id": "20260911-001"
  }
}
```

### `POST /api/ai/query`

Smart Query — natural language question.

**Request:**
```json
{ "query": "Stasiun mana yang terbaik untuk usaha makanan di dekat kampus?" }
```

**Response:**
```json
{
  "data": {
    "answer": "Berdasarkan analisis...",
    "referenced_stations": ["univpancasila", "univindonesia"],
    "source_run_id": "20260911-001"
  }
}
```

---

## 5. Backend Index Integration

**File:** `backend/src/index.js`

Add route registration:

```js
const stationRoutes = require('./routes/station.routes');
app.use('/api/stations', stationRoutes);
app.use('/api/ai', require('./routes/ai.routes')); // for /api/ai/query
```

---

## 6. Package Additions

**Backend:**
```bash
cd backend
npm install @tensorflow/tfjs @google/generative-ai
```

**Frontend (for charts):**
```bash
cd frontend
npm install recharts
```

No Docker changes needed.

---

## 7. Frontend Integration

### New Hook: `useStations.ts`

```ts
// frontend/src/hooks/useStations.ts
export function useStations() {
  // Fetches /api/stations on mount
  // Caches in React state
  // Provides: stations, getStation(id), loading, error
}
```

### Pages to Update

| Page | Change |
|------|--------|
| `PropertiTOD.tsx` | Use `useStations()` instead of `KRL_STATIONS`; color markers by score; filter by `minScore` slider; show `typology` layer |
| `StationDetail.tsx` | Fetch from `/api/stations/:id` on mount; fill score, rank, typology, growth; replace placeholders with real chart data; add AI insight panel with `/api/stations/:id/insight` |
| `Dashboard.tsx` | No structural changes — purely navigation + layout; station links use `id` which routes correctly |

### Pages NOT Changed

- `EkonomiKawasan.tsx` — Overpass API POI fetching is real, not ML
- `Home.tsx`, `Login.tsx`, `Register.tsx`, etc. — no ML dependencies

### Station Link Format

Existing links use `/map/tod/stasiun/:id` where `id` matches `station.id` from `KRL_STATIONS`. The API returns the same `id` field, so routing is compatible without changes.

---

## 8. Execution Order

### Phase 1: Foundation
1. Create `backend/src/services/syntheticData.js` — generates all station features + time series
2. Create `backend/src/services/ai/clustering.service.js` — TF.js KMeans
3. Create `backend/src/services/ai/scoring.service.js` — weighted formula

### Phase 2: ML Services
4. Create `backend/src/services/ai/forecasting.service.js` — exponential smoothing
5. Create `backend/src/services/ai/classification.service.js` — rule-based
6. Create `backend/src/services/ai/llm.service.js` — Gemini API wrapper

### Phase 3: API Layer
7. Create `backend/src/routes/station.routes.js` — all station endpoints
8. Create `backend/src/routes/ai.routes.js` — `/api/ai/query`
9. Register routes in `backend/src/index.js`

### Phase 4: Frontend Integration
10. Create `frontend/src/hooks/useStations.ts` — React hook
11. Update `PropertiTOD.tsx` — wire to API
12. Update `StationDetail.tsx` — wire to API, add charts, add AI insight panel
13. Install `recharts` in frontend

### Phase 5: Testing
14. Verify all endpoints return correct JSON shape
15. Verify frontend pages render without errors
16. Test LLM fallback when Gemini API key is absent

---

## 9. File Map

```
backend/src/
├── index.js                    # add route registration
├── routes/
│   ├── station.routes.js        # NEW: all /api/stations/* endpoints
│   └── ai.routes.js             # NEW: /api/ai/query
└── services/
    ├── syntheticData.js         # NEW: station features + time series generation
    └── ai/
        ├── clustering.service.js   # NEW: TF.js KMeans
        ├── scoring.service.js      # NEW: weighted formula
        ├── forecasting.service.js  # NEW: exponential smoothing
        ├── classification.service.js # NEW: rule-based
        └── llm.service.js          # NEW: Gemini API

frontend/src/
├── hooks/
│   └── useStations.ts          # NEW: fetch + cache station data
└── pages/
    ├── PropertiTOD.tsx         # MODIFY: wire to useStations()
    └── StationDetail.tsx       # MODIFY: wire to API, add charts, add AI insight
```

---

## 10. Data Flow

```
Backend startup
    │
    ▼
syntheticData.js  ──►  clustering.service.js  ──► scoring.service.js
    │                         │                         │
    │                         │                         │
    ▼                         ▼                         ▼
timeSeries              typology labels          scores + ranks
    │                                                 │
    ▼                                                 │
forecasting.service.js ───────────────────────────────┤
    │                                                 │
    ▼                                                 ▼
3-month forecast ──────────────────────► classification.service.js
    │                                                 │
    └──────────────────────────┬───────────────────────┘
                              ▼
                    llm.service.js (Gemini)
                              │
                              ▼
                    All services populate a
                    stationStore (in-memory cache)
                              │
                              ▼
                    station.routes.js serves JSON
                              │
                              ▼
                    Frontend useStations hook
                              │
                              ▼
                    PropertiTOD + StationDetail pages
```

---

## 11. Environment Variables

### Backend (`backend/.env`)

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

Already present in `.env.example`. No new variables needed.

### Frontend

No new environment variables. Existing `VITE_CARTO_API_KEY` and Supabase vars suffice.

---

## 12. Error Handling

| Scenario | Behavior |
|----------|----------|
| TF.js fails to initialize | Log warning, return `data_status: "unavailable"` for clustering |
| Gemini API key missing or request fails | Return fallback deterministic template string |
| Station not found | 404 JSON `{ error: "Station not found" }` |
| Synthetic data seed produces edge case | Data is deterministic; accept minor variance |

---

## 13. Known Limitations

1. **All data is synthetic** — no real passenger volumes, property data, or survey results. The entire ML stack produces plausible-looking outputs based on seeded randomness. This must be communicated to users.
2. **No real forecasting accuracy** — exponential smoothing on 36 synthetic points has no real predictive power. The 3-month horizon is for UI demonstration only.
3. **Clustering is unsupervised on synthetic features** — the cluster labels are hand-crafted from centroid inspection, not validated against real station typologies.
4. **Gemini API rate limits** — the `/api/ai/query` endpoint should be rate-limited. Already handled by existing `rateLimit` middleware on `/api`.

---

## 14. Verification Checklist

After implementation:

- [ ] `GET /api/stations` returns 84 stations with `score`, `rank`, `typology`
- [ ] `GET /api/stations/typologies` returns 4 cluster profiles
- [ ] `GET /api/stations/jakartakota` returns full detail with score breakdown
- [ ] `GET /api/stations/jakartakota/forecast` returns 36 historical + 3 forecast rows
- [ ] `GET /api/stations/jakartakota/insight` returns narrative text (or template fallback)
- [ ] `POST /api/ai/query` returns answer referencing station IDs
- [ ] `PropertiTOD` page shows score-colored markers and typology filters work
- [ ] `StationDetail` page shows real score, rank, typology, AI insight panel, and forecast charts
- [ ] No page crashes when `GEMINI_API_KEY` is absent (fallback works)
- [ ] `docker compose up --build` succeeds with no errors
