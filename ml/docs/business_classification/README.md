# Classification rekomendasi jenis usaha

## Keputusan saat ini

Frontend memang menerima kategori POI dari Overpass (`Makanan`, `Minuman`, `Hobi`, `Toko Buku`, `Lainnya`) dan radius 500--1.000 m, tetapi belum menyimpan snapshot ber-timestamp, transaksi, label keberhasilan usaha, atau label jenis usaha yang direkomendasikan. Dataset development `ml/business_classification/data/location_opportunity_training.csv` menambahkan proksi sintetis untuk kebutuhan tersebut dengan target kategori yang sama persis dengan UI. Ini hanya untuk menguji pipeline classifier, contract API, dan tampilan rekomendasi; ia bukan bukti bahwa suatu kategori benar-benar berhasil di lokasi tersebut.

POI yang sedang tampil di aplikasi tetap bukan training label. Semua hasil dari dataset ini wajib berstatus `synthetic_training_only` sampai tersedia outcome bisnis atau survei berlabel.

## Gate pelatihan berikutnya

- Notebook: `ml/business_classification/notebooks/train_business_recommender.ipynb`
- Model: `ml/business_classification/models/business_recommender.pkl`
- Output: `ml/business_classification/outputs/location_recommendations.csv`, `metrics.json`, dan alasan fitur

Satu baris training harus mewakili lokasi-radi us-waktu dan berisi fitur kepadatan/kategori transaksi, POI sekitar, akses jalan kaki, volume stasiun, serta label outcome yang jelas (misalnya kategori usaha dominan atau sukses tervalidasi). Split harus berbasis lokasi atau waktu agar titik yang sama tidak bocor ke train dan test. Evaluasi dengan macro F1, balanced accuracy, confusion matrix, dan top-k recommendation accuracy bila outputnya ranking kategori.

Sebelum gate lulus, fitur Hotspot Finder hanya menyatakan jumlah/jenis POI yang ditemukan dan tidak mengklaim “kategori usaha terbaik”.
