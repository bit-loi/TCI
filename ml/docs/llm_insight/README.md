# LLM insight dan smart query

## Peran

LLM adalah lapisan interpretasi, bukan model yang menciptakan skor, forecast, tipologi, atau rekomendasi bisnis. Ia menerima payload terstruktur dari hasil forecasting, clustering, weighted score/model yang sudah lolos validasi, serta pilihan stasiun/radius/kategori dari UI.

## Rencana implementasi

- Notebook uji prompt: `ml/llm_insight/notebooks/evaluate_insight_prompts.ipynb`
- Output audit: `ml/llm_insight/outputs/insight_evaluations.jsonl`
- Tidak ada `.pkl`: LLM API bukan model lokal yang dilatih oleh proyek ini.

Dataset `ml/llm_insight/data/station_insight_context.jsonl` menyediakan 77 payload konteks sintetis dan `smart_query_evaluation.csv` menyediakan fixture evaluasi prompt. Keduanya dipakai untuk menguji grounding, schema respons, serta disclaimer data sintetis; keduanya bukan korpus fine-tuning atau sumber fakta lapangan.

Service backend melakukan allow-list field, menyertakan sumber/versi run dan batasan data sintetis dalam system prompt, lalu memvalidasi respons terhadap schema JSON. Respons minimal memuat `summary`, `evidence`, `limitations`, dan optional `map_action` hanya jika station ID yang disebut ada pada hasil. Jika model tidak tersedia, gunakan template narasi deterministik dari payload yang sama.

Quality gate: sampling manual untuk kesetiaan narasi terhadap angka, dilarang memberi nasihat investasi/perizinan final, dilarang mengarang data/angka, dan semua jawaban menampilkan bahwa data sekarang prototype sintetis. Smart query baru boleh menyorot lokasi setelah classifier/recommender terkait memiliki data dan evaluasi yang memadai.
