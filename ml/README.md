# ML Artifact Integration

Folder ini menyimpan pipeline training dan artefak analisis TOD. Status seluruh hasil saat ini adalah `synthetic_prototype`: hanya untuk demonstrasi lomba, bukan rekomendasi investasi atau bisnis produksi.

## Backend Handoff

Setelah seluruh notebook ML selesai dieksekusi, jalankan:

```powershell
python ml/scripts/build_app_payload.py
```

Perintah tersebut membangun dua artefak yang dikonsumsi backend:

| File | Tujuan |
| --- | --- |
| `ml/outputs/station_analysis.json` | Detail, skor, forecast, tipologi, dan rekomendasi bisnis setiap stasiun. |
| `ml/outputs/station_analysis.geojson` | Layer marker TOD untuk peta. |

Jangan sajikan CSV dari folder model langsung ke frontend. Backend harus membaca dua artefak di atas saat startup atau menyimpannya dalam cache read-only, lalu mengembalikan JSON melalui endpoint.

Folder output per-model di-ignore, tetapi `ml/outputs/` adalah artifact handoff root dan perlu ditambahkan secara eksplisit untuk demo atau disertakan dalam deployment artifact/penyimpanan bersama. Jalankan ulang builder setiap kali output model berubah. Script builder di `ml/scripts/` disertakan dalam repositori dan dapat dijalankan langsung dari root proyek.

## Endpoint Contract

Prefix yang disarankan adalah `/api/analysis`.

| Method | Endpoint | Response |
| --- | --- | --- |
| `GET` | `/api/analysis/stations` | Objek `{ source_status, stations }` dari `station_analysis.json`. |
| `GET` | `/api/analysis/stations/:stationId` | Satu objek stasiun dari array `stations`. Kembalikan `404` jika tidak ada. |
| `GET` | `/api/analysis/tod-layer` | GeoJSON `FeatureCollection` dari `station_analysis.geojson`. |

Contoh bentuk respons detail `GET /api/analysis/stations/{stationId}`:

```json
{
  "station_id": "JAK01",
  "station_name": "...",
  "line": "...",
  "as_of_period": "...",
  "score": {
    "value": 72.45,
    "rank": 3,
    "priority": "high",
    "method": "weighted_prototype",
    "model_prediction": 71.8,
    "model_method": "random_forest",
    "breakdown": []
  },
  "typology": { "cluster_id": 1, "label": "..." },
  "forecast": [],
  "business_recommendations": [],
  "insight_context": {},
  "source_status": "synthetic_prototype",
  "data_limitations": "Synthetic prototype only; not a production investment or business recommendation."
}
```

`business_recommendations` berisi tiga kandidat per stasiun, masing-masing untuk radius `500`, `750`, dan `1000` meter. `forecast` adalah deret waktu yang siap dipakai grafik. Frontend harus selalu menampilkan atau mampu mengakses `source_status` dan `data_limitations`.

## Implementasi Backend Minimal

Contoh berikut untuk Express. Sesuaikan lokasi file untuk lingkungan deployment dan muat sekali saat backend dimulai, bukan pada setiap request.

```js
const fs = require("fs");
const path = require("path");

const artifactDir = path.resolve(__dirname, "../../ml/outputs");
const stationPayload = JSON.parse(
  fs.readFileSync(path.join(artifactDir, "station_analysis.json"), "utf8"),
);
const todLayer = JSON.parse(
  fs.readFileSync(path.join(artifactDir, "station_analysis.geojson"), "utf8"),
);

app.get("/api/analysis/stations", (_req, res) => res.json(stationPayload));

app.get("/api/analysis/stations/:stationId", (req, res) => {
  const station = stationPayload.stations.find(
    (item) => item.station_id === req.params.stationId,
  );
  if (!station) return res.status(404).json({ error: "Station not found" });
  return res.json(station);
});

app.get("/api/analysis/tod-layer", (_req, res) => res.json(todLayer));
```

Validasi keberadaan file dan `source_status` saat startup. Bila artifact tidak ada atau invalid, backend sebaiknya gagal startup atau mengembalikan `503`, bukan mengirim data kosong yang terlihat seperti hasil valid.

## Model Files

File `.pkl` di `*/models/` bukan kebutuhan frontend atau endpoint read-only. File tersebut diperlukan hanya bila backend menerima data baru dan melakukan inferensi secara langsung:

- `regression_scoring/models/investment_score_pipeline.pkl`
- `clustering/models/typology_pipeline.pkl`
- `forecasting/models/forecasting_bundle.pkl`
- `business_classification/models/business_recommender.pkl`

Untuk inferensi langsung, gunakan environment Python terpisah dengan `ml/requirements.txt`, schema fitur dari `*/outputs/feature_schema.json`, preprocessing yang sama, serta artifact model dari run yang sama. Jangan deserialize `.pkl` dari sumber tidak tepercaya.
