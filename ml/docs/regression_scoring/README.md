# Regression dan station investment score

## Keputusan saat ini

PRD meminta score/ranking 0--100 berdasarkan volume, aktivitas usaha, properti/lahan, aksesibilitas, dan atribut kawasan. Dataset development `ml/regression_scoring/data/station_month_features.csv` sekarang menyediakan proksi sintetis untuk seluruh indikator tersebut dan target `investment_potential_score`. Dataset itu boleh dipakai untuk menguji notebook, format artefak, dan integrasi API; targetnya dibuat oleh formula sintetis sehingga metrik model hanya menunjukkan kemampuan mereproduksi pola dummy, bukan validitas investasi dunia nyata.

Data observasi asli untuk target investasi/validasi, aktivitas usaha, lahan/properti, dan jaringan pedestrian masih belum tersedia. Karena itu hasil dari dataset development wajib memakai `source_status=synthetic_training_only` dan tidak boleh diposisikan sebagai predictive score produksi.

## Fallback yang diizinkan

Saat UI membutuhkan skor sebelum data lengkap, pakai **weighted scoring deterministic** terpisah dari ML. Publikasikan rumus, bobot, nilai dinormalisasi, sumber tiap indikator, dan `score_method=weighted_prototype`; komponen yang belum ada tetap unavailable, bukan nol. Ranking hanya diberikan jika score memiliki indikator minimum yang telah disetujui.

## Gate pelatihan berikutnya

- Notebook: `ml/regression_scoring/notebooks/train_investment_model.ipynb`
- Model: `ml/regression_scoring/models/investment_score_pipeline.pkl`
- Output: `ml/regression_scoring/outputs/station_scores.csv`, `metrics.json`, dan breakdown per indikator

Mulai pelatihan hanya bila ada minimal target yang terdefinisi (misalnya label kelayakan/survey atau nilai pasar yang berizin), sumber property/lahan, ukuran aktivitas usaha ber-timestamp, metrik aksesibilitas jaringan, dan sampel cukup untuk split menurut stasiun/waktu. Bandingkan ElasticNet atau Random Forest dengan baseline weighted score; laporkan MAE/RMSE dan feature importance yang tidak menyesatkan sebagai kausalitas.
