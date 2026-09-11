# Forecasting volume penumpang

## Tujuan dan kontrak

Menyediakan garis historis dan garis prediksi putus-putus pada Trend Dashboard/`StationDetail`. Inputnya adalah 36 observasi volume penumpang bulanan untuk setiap `station_code`; outputnya tiga periode masa depan per stasiun, nilai aktual historis, interval prediksi bila metode mendukungnya, dan MAE/RMSE per holdout.

## Rencana notebook dan artefak

- Notebook: `ml/forecasting/notebooks/train_forecasting.ipynb`
- Model: `ml/forecasting/models/forecasting_bundle.pkl`
- Output UI: `ml/forecasting/outputs/station_forecasts.csv` dan `metrics.json`

Model awal membandingkan baseline seasonal-naive (bulan sama tahun lalu bila tersedia) dengan ETS sederhana per stasiun. Validasi menggunakan holdout berbasis waktu: latih 2023-01--2024-12 dan validasi 2025-01--2025-12. Hindari LSTM/Prophet pada 36 titik per stasiun karena data terlalu pendek untuk klaim model kompleks. Pilih metode paling sederhana yang mengalahkan baseline secara konsisten; jika tidak, publish baseline secara eksplisit.

Fitur yang diizinkan adalah waktu, nilai lag, dan rolling statistics yang hanya memakai masa lalu. Volume aktual periode uji tidak boleh menjadi fitur. Horizon rilis awal: 3 bulan, bukan 6 bulan, karena histori terbatas dan bersifat sintetis.

Quality gate: setiap stasiun memiliki urutan bulan lengkap; MAE/RMSE dicatat pada skala absolut dan persen; prediksi negatif di-clamp ke nol serta dicatat. Status API harus `synthetic_prototype`.
