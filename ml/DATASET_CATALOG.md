# Katalog dataset training TCI

Semua dataset dan hasil dalam struktur `ml/` saat ini berstatus **`synthetic_prototype`**. Dataset tersebut dibuat untuk membangun, menguji, dan mendemonstrasikan pipeline; bukan sebagai bukti kondisi lapangan atau dasar keputusan investasi.

| Fitur | Dataset | Grain | Target / tujuan |
| --- | --- | --- | --- |
| Forecasting | `forecasting/data/passenger_volume_monthly.csv` | Stasiun-bulan, 2023-01 s.d. 2025-12 | Volume penumpang bulanan |
| Clustering | `clustering/data/station_master.csv` | Stasiun | Membentuk tipologi dari profil transit |
| Regression/scoring | `regression_scoring/data/station_month_features.csv` | Stasiun-bulan | `investment_potential_score` sintetis 0--100 |
| Classification | `business_classification/data/location_opportunity_training.csv` | Stasiun-bulan-radius | `recommended_business_category` sintetis sesuai kategori UI |
| LLM insight | `llm_insight/data/station_insight_context.jsonl` | Stasiun pada 2025-12 | Konteks terstruktur untuk prompt/guardrail, bukan data fine-tuning |

## Asal dan reproduksibilitas

Workbook yang diberikan tim disalin sebagai sumber mentah ke `shared/raw/Dummy_Dataset_Volume_Penumpang_KRL_Jabodetabek.xlsx`. Script lokal `scripts/generate_synthetic_training_datasets.py` membaca workbook itu dan membangkitkan seluruh turunan dengan seed `20260911`. Karena `scripts/` dan `shared/raw/` di-ignore, clone baru dapat melatih dari dataset turunan yang sudah di-version, tetapi tidak dapat membangkitkan ulang dataset tanpa menerima dua input lokal tersebut. Manifest, jumlah record, keterbatasan, serta nama generator berada pada `shared/manifests/synthetic_dataset_manifest.json`.

`shared/processed/station_crosswalk.csv` adalah kontrak join: `station_code` dari dataset sumber ke `station_id` frontend. Selalu gunakan crosswalk ini saat membuat artefak model/API.

Dataset sumber mencakup 77 dari 84 `station_id` yang ada di frontend saat ini. Tujuh stasiun frontend yang belum tercakup harus tetap menampilkan status data belum tersedia, bukan hasil yang diimputasi. Dua perbedaan nama telah dimasukkan secara eksplisit pada crosswalk: BNI City → `sudirmanbaru` dan Metland Telaga Murni → `telagamurni`.

## Batas penggunaan

- Label regression dan classification dibuat oleh formula sintetis dengan noise terkontrol. Nilai evaluasinya mengukur reproduksi pola sintetis, bukan akurasi bisnis dunia nyata.
- Data properti, akses pedestrian, aktivitas usaha, POI, dan outcome bisnis dalam dataset turunan bukan observasi MAPID/OSM/KAI aktual.
- LLM tidak membutuhkan dan tidak menghasilkan `.pkl`; data LLM ini dipakai untuk menguji bahwa narasi hanya memakai fakta yang disediakan dan menyebut keterbatasan data.
