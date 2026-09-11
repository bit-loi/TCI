# Clustering tipologi stasiun

## Tujuan dan kontrak

Menghasilkan layer tipologi stasiun berwarna serta label yang dapat dijelaskan di peta TOD dan detail stasiun. Data tersedia untuk 77 stasiun: volume tahunan/rata-rata harian 2025, pertumbuhan YoY, jumlah lintas, status hub, proksi kepadatan bisnis 750 m, indeks akses pejalan kaki, jarak Monas, tipe stasiun, lintas, dan koordinat.

## Rencana notebook dan artefak

- Notebook: `ml/clustering/notebooks/train_clustering.ipynb`
- Model: `ml/clustering/models/typology_pipeline.pkl`
- Output UI: `ml/clustering/outputs/station_typologies.csv` dan `cluster_profiles.json`

Pipeline menggunakan imputasi yang tidak mengubah nol, one-hot untuk kategori, `StandardScaler` untuk numerik, lalu evaluasi `KMeans` dengan kandidat k=2--5 menggunakan silhouette score dan interpretabilitas. Koordinat hanya dipakai sebagai geometri layer peta, bukan fitur clustering, agar kedekatan geografis tidak menggantikan karakter aktivitas kawasan. `cluster_id` bukan label bermakna; label diterjemahkan dari centroid sesudah review, misalnya `Hub aktivitas tinggi`, `Koridor komuter menengah`, atau `Aktivitas lebih rendah`. Label `Residential` tidak boleh dipakai hanya karena UI lama menyediakannya: tidak ada fitur hunian/properti pada data saat ini.

Quality gate: silhouette dan ukuran tiap cluster direkam, tidak ada cluster berisi satu stasiun tanpa justifikasi, urutan label stabil lewat pemetaan centroid, dan halaman TOD hanya memfilter label yang benar-benar diekspor.
