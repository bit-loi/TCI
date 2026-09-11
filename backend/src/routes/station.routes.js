const express = require("express");
const { STATION_DATA, CLUSTER_LABELS } = require("../data/stations");

const router = express.Router();

// ponytail: single GET returns all computed station data
router.get("/", (_req, res) => {
  const data = Object.values(STATION_DATA).map(st => ({
    id: st.id, name: st.name, coord: st.coord, lines: st.lines,
    score: parseFloat(st.score.toFixed(1)), rank: st.rank,
    typology: st.typology, growth: st.growth, data_status: st.data_status,
  }));
  res.json({ data, meta: { total: data.length, generated_at: new Date().toISOString() } });
});

// ponytail: cluster profiles
router.get("/typologies", (_req, res) => {
  const profiles = CLUSTER_LABELS.map((label, i) => ({
    clusterId: i, label,
    stationCount: Object.values(STATION_DATA).filter(s => s.clusterId === i).length,
    characteristics: i === 0 ? ["Konektivitas tinggi", "Centrality tinggi", "Multi-line"]
      : i === 1 ? ["Koridor utama", "Volume tinggi", "3+ lintas"]
      : i === 2 ? ["Hub transit", "Aksesibilitas baik", "2 lintas"]
      : ["Aktivitas lokal", "Volume rendah", "Single line"],
  }));
  res.json({ data: profiles });
});

// ponytail: single station full detail
router.get("/:id", (req, res) => {
  const st = STATION_DATA[req.params.id];
  if (!st) return res.status(404).json({ error: "Station not found" });
  const { timeSeries, features, ...rest } = st; // omit raw features from API response
  res.json({ data: rest });
});

// ponytail: historical + forecast time series
router.get("/:id/forecast", (req, res) => {
  const st = STATION_DATA[req.params.id];
  if (!st) return res.status(404).json({ error: "Station not found" });
  res.json({ data: { stationId: st.id, historical: st.timeSeries, forecast: st.forecast } });
});

// ponytail: LLM insight (Gemini or template fallback)
router.get("/:id/insight", async (req, res) => {
  const st = STATION_DATA[req.params.id];
  if (!st) return res.status(404).json({ error: "Station not found" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({ data: { stationId: st.id, text: templateInsight(st), source_run_id: "fallback-001" } });
  }

  try {
    const prompt = `Station: ${st.name} (${st.lines.join(", ")})
Score: ${st.score}/100 (Rank #${st.rank})
Typology: ${st.typology.label}
YoY Growth: ${st.growth.historical_yoy_pct}%
Forecast 3mo: ${st.forecast.map(f => `${f.period}: ${f.predicted_passengers.toLocaleString()}`).join(", ")}
Recommendation: ${st.recommendation.category} (confidence ${(st.recommendation.confidence * 100).toFixed(0)}%)

Berikan ringkasan 2-3 kalimat dalam Bahasa Indonesia. Catat bahwa semua data adalah prototipe sintetis. Tidak给出 investasi nasihat.`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || templateInsight(st);
    res.json({ data: { stationId: st.id, text, source_run_id: "gemini-001" } });
  } catch {
    res.json({ data: { stationId: st.id, text: templateInsight(st), source_run_id: "fallback-001" } });
  }
});

// ponytail: template insight fallback
function templateInsight(st) {
  return `Stasiun ${st.name} memiliki skor investasi ${st.score.toFixed(1)}/100 (peringkat #${st.rank}) dengan tipologi "${st.typology.label}". Volume penumpang tumbuh ${st.growth.historical_yoy_pct.toFixed(1)}% YoY. Rekomendasi usaha: ${st.recommendation.category}. Data saat ini adalah prototipe sintetis dan bukan hasil observasi lapangan.`;
}

module.exports = router;
