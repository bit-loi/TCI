const express = require("express");
const { STATION_DATA } = require("../data/stations");

const router = express.Router();

// ponytail: smart query via Gemini, template fallback
router.post("/query", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "query required" });

  const stations = Object.values(STATION_DATA);
  const top5 = [...stations].sort((a, b) => b.score - a.score).slice(0, 5);

  const context = top5.map(st =>
    `${st.name}: skor ${st.score}, rank #${st.rank}, tipologi ${st.typology.label}, ${st.recommendation.category}`
  ).join("\n");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({ data: { answer: `Data teratas: ${top5[0].name} (skor ${top5[0].score})`, referenced_stations: [top5[0].id], source_run_id: "fallback-001" } });
  }

  try {
    const prompt = `Konteks stasiun:\n${context}\n\nPertanyaan: ${query}\n\nJawab dalam Bahasa Indonesia singkat (2-3 kalimat). Referensi stasiun yang disebutkan. Semua data adalah prototipe sintetis.`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    const json = await response.json();
    const answer = json?.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak dapat memproses pertanyaan.";
    res.json({ data: { answer, referenced_stations: top5.map(s => s.id), source_run_id: "gemini-001" } });
  } catch {
    res.json({ data: { answer: `Stasiun teratas: ${top5[0].name} (skor ${top5[0].score}). Data adalah prototipe sintetis.`, referenced_stations: [top5[0].id], source_run_id: "fallback-001" } });
  }
});

module.exports = router;
