# Rencana AI Integration TCI

## Status dan keputusan

Dokumen ini menerjemahkan bagian **AI Integration** pada PRD ke implementasi yang dapat dipertanggungjawabkan terhadap kode dan data yang tersedia pada 11 September 2026. Tahap ini hanya membuat rencana dan struktur folder. Notebook pelatihan (`.ipynb`) dan artefak model (`.pkl`) dibuat pada tahap implementasi setelah kontrak input/output di bawah disetujui.

Dataset saat ini adalah data dummy/sintetis. Isinya 77 stasiun, 2.772 baris volume bulanan 2023-01 sampai 2025-12, dan profil stasiun lengkap tanpa nilai hilang. Dataset ini cukup untuk prototipe forecasting dan clustering. Ia **tidak** memuat transaksi/Menu Go/Struk Go, properti/lahan, jaringan pedestrian, survei berlabel, atau target potensi investasi. Karena itu regression/scoring, classification, dan LLM tidak boleh diposisikan sebagai model terlatih dari dataset ini.

| AI integration PRD | Keputusan data saat ini | Output yang dapat diberikan sekarang |
| --- | --- | --- |
| Forecasting | Layak diprototipe | Prediksi volume bulanan 3 bulan per stasiun, tren dan metrik holdout |
| Clustering | Layak diprototipe | `cluster_id`, label tipologi berbasis fitur yang tersedia, dan ringkasan profil cluster |
| Regression / predictive score | Ditunda | Weighted score yang dapat ditelusuri, bukan prediksi ML |
| Classification | Ditunda | Tidak ada rekomendasi bisnis berbasis model; tampilkan status data belum cukup |
| LLM insight | Ditunda sebagai API | Narasi template berbasis output tervalidasi, tanpa klaim prediksi baru |

## Kesesuaian dengan UI dan backend saat ini

Kode frontend memiliki dataset lokal `KRL_STATIONS`, peta ekonomi dengan input `station.id`, koordinat, kategori POI, dan radius 500--1.000 m, serta peta TOD/detail stasiun yang menunggu `score`, `rank`, `typology`, dan `growth`. Backend hanya menyediakan health dan auth; semua controller/service analisis dan AI masih kosong. Maka artefak AI harus terlebih dahulu diekspor sebagai tabel hasil versioned, lalu disajikan lewat API Express. Model `.pkl` tidak dipanggil langsung dari Node.js.

Kontrak respons target per stasiun:

```json
{
  "station_id": "jakartakota",
  "station_name": "Jakarta Kota",
  "score": null,
  "rank": null,
  "typology": {"cluster_id": 0, "label": "Hub aktivitas tinggi"},
  "growth": {"historical_yoy_pct": 6.36, "forecast_3m_pct": 1.8},
  "forecast": [{"period": "2026-01", "predicted_passengers": 1200000}],
  "insight": {"text": "...", "source_run_id": "..."},
  "data_status": "synthetic_prototype"
}
```

`station_id` harus memakai ID frontend, sedangkan `station_code` sumber (`STA-001`) disimpan sebagai crosswalk. Jangan join memakai nama bebas. Untuk stasiun yang tidak ada pada Excel atau hasilnya belum tersedia, UI menampilkan status unavailable; jangan mengganti dengan angka contoh.

## Pipeline data PRD yang dioperasionalkan

1. **Cleaning:** periksa duplikasi kombinasi `station_code + period`, nilai volume negatif, periode yang hilang, dan koordinat di luar Jabodetabek. Interpolasi hanya bila periode memang hilang dan tandai `imputed=true`; data dummy saat ini lengkap sehingga tidak perlu imputasi.
2. **Standardization:** parse `Periode (YYYY-MM)` menjadi tanggal awal bulan, ubah nama menjadi slug `station_id`, samakan latitude/longitude ke EPSG:4326, normalisasi `Status Hub Transit` menjadi boolean dan kategori lintas/tipe sebagai kategori eksplisit.
3. **Enrichment:** pada tahap ini hanya fitur turunan yang aman dari Excel: lag 1/3/12 bulan, rolling mean 3/6 bulan, pertumbuhan, jumlah lintas, status hub, jarak Monas, dan koordinat. Tambahan POI, jalan/pedestrian, properti, transaksi, serta survei hanya boleh masuk setelah sumber, timestamp, radius, dan kunci spasialnya tersedia.
4. **Validation:** rekonsiliasi total per lintas/tahun dengan angka kalibrasi pada sheet `Catatan_Asumsi`, pastikan 36 bulan per stasiun, lalu lakukan time-based holdout untuk forecasting. Validasi lapangan hanya dilakukan jika survey berkoordinat, bertanggal, dan memiliki observasi yang relevan tersedia.

Setiap run menghasilkan `data_quality_report.json`, `feature_schema.json`, dan manifest yang berisi sumber data, rentang waktu, jumlah record, versi kode, waktu run, serta penanda `synthetic_prototype`.

## Struktur target

```text
ml/
  docs/
    AI_INTEGRATION_PLAN.md
    forecasting/README.md
    clustering/README.md
    regression_scoring/README.md
    business_classification/README.md
    llm_insight/README.md
  forecasting/{notebooks,models,outputs}/
  clustering/{notebooks,models,outputs}/
  regression_scoring/{notebooks,models,outputs}/
  business_classification/{notebooks,models,outputs}/
  llm_insight/{notebooks,outputs}/
  shared/{raw,processed,manifests}/
```

Setiap notebook membaca data dari `ml/shared`, tidak dari path Downloads. Setelah pelatihan, artefak model dan hasil dipisahkan: `.pkl` hanya berisi pipeline model/preprocessor; UI/API membaca CSV/JSON hasil yang sudah divalidasi. Jangan commit data mentah sensitif atau credential API.

## Urutan implementasi

1. Tambahkan dataset dummy ke area data proyek yang dapat direproduksi dan buat crosswalk ke `KRL_STATIONS`.
2. Bangun preprocessing bersama serta quality report.
3. Implementasikan forecasting dan clustering, evaluasi, lalu ekspor hasil per stasiun.
4. Tambahkan endpoint read-only dan ubah frontend agar memakai hasil API, termasuk loading/unavailable state.
5. Setelah data MAPID/Property Go/survei tersedia, jalankan gate regression dan classification. LLM hanya aktif sesudah hasil numerik tervalidasi.

## Definition of done untuk pelatihan nanti

- Notebook dapat dijalankan ulang dari data mentah sampai artefak dan tidak memiliki leakage waktu.
- File `.pkl`, `metrics.json`, `feature_schema.json`, manifest, dan hasil per-stasiun ditulis ke folder fitur yang sama.
- Metrik serta batasan data dummy tampil dalam metadata hasil.
- Endpoint dan UI memakai hasil ekspor, bukan nilai hard-coded atau contoh.
- Kegagalan quality gate mengembalikan status unavailable, bukan skor/rekomendasi palsu.
