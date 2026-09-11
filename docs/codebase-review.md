# Review codebase TCI

Ditinjau pada 11 September 2026 berdasarkan source code lokal, README, `PRD.md`, dan seluruh teks PRD kompetisi yang dilampirkan pengguna. Review ini menilai implementasi yang ada di repository; data, konfigurasi dashboard Supabase, hasil survei, dan deployment eksternal tidak diaudit.

## Pemahaman produk

TCI adalah sistem pendukung keputusan untuk potensi ekonomi dan pengembangan kawasan sekitar stasiun KRL Jabodetabek. Dua kebutuhan utamanya adalah pemilihan lokasi usaha bagi UMKM/pemasar dan perbandingan potensi kawasan bagi pengembang/pemerintah. Persona akademisi membutuhkan akses publik untuk eksplorasi.

PRD lampiran menargetkan empat layer: ekonomi kawasan, properti/TOD, tipologi stasiun, dan survei lapangan. Dataset MAPID, historis penumpang KAI Commuter, serta konteks BIG/OSM perlu dihubungkan melalui identitas stasiun, koordinat, periode data, dan validasi lapangan.

Hal yang memengaruhi implementasi:

- Radius 500–1.000 meter adalah cakupan awal. Lingkaran radius dan jangkauan jalan kaki melalui jaringan pedestrian perlu dibedakan.
- Hotspot perlu berasal dari ukuran aktivitas/kepadatan yang dihitung. Titik POI saja belum menghasilkan hotspot aktivitas ekonomi.
- Skor 0–100 perlu memiliki indikator, bobot, normalisasi, dan alasan yang dapat ditelusuri. Ranking tanpa data pembentuk skor belum memenuhi acceptance criteria.
- Forecasting, clustering, regression, dan classification bersifat kondisional pada kelengkapan dataset. Lampiran memperbolehkan analisis spasial dan weighted scoring ketika data tidak memadai; tidak perlu memaksakan lima model.
- LLM menjelaskan hasil analisis yang benar-benar dihitung. Angka atau rekomendasi yang ditulis langsung di komponen belum menjadi hasil AI.
- Volume penumpang real-time berada di luar scope lampiran. Filter waktu dapat memakai observasi historis bertimestamp; ini berbeda dari streaming data real-time.
- Survei harus berupa observasi lapangan dengan koordinat, kategori, waktu, kondisi, dan foto yang sesuai ketentuan lampiran. Titik contoh belum merupakan ground truth.
- Model freemium perlu tetap memberikan manfaat publik. Proteksi area akun tidak otomatis berarti seluruh peta harus membutuhkan login.
- Target efisiensi, akurasi pemasaran, dan margin dalam PRD adalah proyeksi dampak, belum hasil pengukuran aplikasi.

`PRD.md` di repository masih menggambarkan lima model lebih pasti daripada lampiran terbaru. README juga menyebut model konkret, sedangkan implementasinya belum ada. Dokumentasi perlu diselaraskan dengan metode dan data yang akhirnya tersedia.

## Arsitektur yang benar-benar tersedia

| Bagian | Implementasi saat ini |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind, React Router; halaman home, auth, dashboard, dua peta, dan detail stasiun. |
| Autentikasi | Login/registrasi langsung melalui Supabase JS; `AuthProvider` memuat session dan mendengarkan perubahan auth. |
| Peta | Leaflet/React Leaflet, basemap CARTO, dataset stasiun lokal, pengambilan POI dari Overpass langsung di frontend. |
| Backend | Express, CORS, JSON parser, logger, error handler; endpoint `/api/health` dan `/api/auth/me`. |
| Database spasial | Client Supabase tersedia, tetapi `backend/src/config/db.js` kosong. Tidak ditemukan implementasi query PostGIS di service yang ditinjau. |
| Analisis dan AI | Seluruh file controller domain, service domain, lima service AI, dan utilitas spasial masih kosong. |
| Deployment | Ada Docker development, Docker produksi, dan Nginx SPA fallback. Implementasi serverless Vercel tidak terlihat dalam entry point backend saat ini. |

Alur data aktif: UI auth → Supabase; UI peta → dataset TypeScript lokal + Overpass. Belum ada alur aktif UI → API analisis → PostGIS/model AI → hasil analisis.

## Perbaikan auth pada perubahan ini

Penyebab scroll tambahan adalah dekorasi absolut berukuran `w-96 h-96` dengan offset `-right-32 -bottom-32`. Dekorasi tersebut sebelumnya langsung berada dalam container halaman tanpa pembatas overflow, sehingga memperluas area scroll ke kanan dan bawah.

- Menambahkan [AuthLayout](../frontend/src/components/ui/AuthLayout.tsx) untuk background dan struktur halaman login/register yang sama.
- Memindahkan dekorasi ke lapisan `absolute inset-0 overflow-hidden`, dengan `aria-hidden` dan `pointer-events-none`.
- Menggunakan `min-h-dvh` agar minimum tinggi mengikuti viewport dinamis; konten panjang tetap menentukan tinggi dokumen dan dapat di-scroll vertikal.
- Menambahkan `min-w-0` dan pembungkusan teks panjang pada container form.
- Mengurangi padding horizontal kartu pada mobile menjadi 24 px, mempertahankan padding desktop 40 px, dan meratakan judul/deskripsi ke tengah.
- Menonaktifkan animasi kartu ketika pengguna memilih reduced motion.

File halaman: [Login](../frontend/src/pages/Login.tsx), [Register](../frontend/src/pages/Register.tsx). Perubahan ini menangani layout. Implementasi request auth dan navigasi setelah login/registrasi tetap mengikuti kode sebelumnya.

## Temuan prioritas

### 1. Build penuh belum lulus

`npm run build` berhenti di TypeScript sebelum menjalankan Vite:

- [Navbar](../frontend/src/components/ui/Navbar.tsx): `navItems = []` tidak memiliki tipe elemen yang dapat diinferensikan. Ini berasal dari perubahan lokal yang sudah ada sebelum pengerjaan auth.
- [StationDetail](../frontend/src/pages/StationDetail.tsx): mengakses `address`, `rank`, `typology`, `growth`, dan `score`, sementara [tipe Station](../frontend/src/data/krl_stations.tsx) hanya mendefinisikan `id`, `name`, `coord`, dan `lines`.
- [vite.config.ts](../frontend/vite.config.ts): properti `test` belum dikenali oleh tipe konfigurasi yang diimpor dari Vite.

Perbaikannya perlu mempertahankan maksud perubahan navbar, mendefinisikan kontrak data analisis yang benar, serta menyelaraskan konfigurasi Vite/Vitest. Hindari menambahkan angka contoh ke dataset hanya untuk meloloskan kompilasi.

### 2. Alur auth belum lengkap

[App.tsx](../frontend/src/App.tsx) belum mempunyai route `/forgot-password`, `/terms`, atau `/privacy`, meskipun link-nya sudah ada pada halaman auth. Tidak ada catch-all route, sehingga URL yang tidak dikenali tidak memiliki halaman fallback.

Registrasi tanpa session diarahkan ke `/login?registered=true`, tetapi Login belum membaca parameter tersebut atau menampilkan petunjuk konfirmasi email. Pengguna dapat kebingungan karena kembali ke login tanpa penjelasan.

`/dashboard` belum memiliki guard session/loading. Dashboard dapat dirender tanpa login dengan nama fallback `User`; ini merupakan gap alur akun, bukan bukti bahwa data privat backend terbuka. Endpoint `/api/auth/me` sudah memakai middleware token. Kebijakan akses data sebenarnya di Supabase belum diperiksa.

Handler submit belum menggunakan `try/finally`; apabila promise auth melempar exception di luar pola hasil `{ error }`, status loading berpotensi tidak dipulihkan. `AuthProvider` juga belum memiliki penanganan kegagalan `getSession()`.

### 3. Filter ekonomi dapat menampilkan POI yang tidak sesuai pilihan

Pada [EkonomiKawasan](../frontend/src/pages/EkonomiKawasan.tsx):

- Pergantian kategori memanggil `setSelectedCategory`, lalu `selectStation` melalui `setTimeout`. Callback masih menutup state dari render sebelumnya, sehingga query bisa memakai kategori lama sementara label/warna sudah berubah.
- Slider radius hanya mengubah `radius` dan lingkaran buffer. POI tidak otomatis dimuat ulang untuk radius baru.
- `refreshPoi` menghapus cache melalui pembaruan state, lalu langsung memanggil `selectStation`, yang masih dapat membaca cache lama dari closure yang sama.
- Request stasiun sebelumnya tidak dibatalkan ketika pengguna memilih stasiun lain. Respons yang datang terlambat dapat mengganti POI untuk pilihan terbaru.
- `MapFocus` memanggil `map.flyTo` selama render. Pergerakan peta sebaiknya menjadi effect yang bergantung pada stasiun, agar pembaruan state lain tidak memicu pemusatan berulang.

Pemulihan yang disarankan: pisahkan query POI menjadi hook dengan dependency eksplisit `(stationId, radius, category)`, cleanup `AbortController`, dan mekanisme refresh yang tidak membaca cache lama. Ini perlu diuji sebagai perilaku async, bukan hanya tampilan filter.

### 4. Layer dan kontrol analisis belum memenuhi acceptance criteria

| Fitur PRD | Kondisi source code | Pekerjaan yang masih diperlukan |
| --- | --- | --- |
| Hotspot Finder | `CircleMarker` per POI, dengan radius dan warna kategori; belum ada KDE/Gi* atau agregasi aktivitas. | Dataset aktivitas, perhitungan hotspot, serta filter kategori/waktu yang konsisten. |
| Station Investment Score | Peta menampilkan marker stasiun; slider `minScore` belum masuk ke `filteredStations`. | Skor dan breakdown nyata, ranking, polygon kawasan, serta filter skor. |
| Station Typology Map | Pilihan tipologi dan `showTypology` hanya mengubah state kontrol. | Atribut tipologi, filter data, warna dan legenda yang sesuai hasil analisis. |
| Survey Data Layer | Ekonomi merender fragment kosong; TOD menampilkan satu marker berkoordinat tetap. | Data observasi tervalidasi beserta atribut dan bukti lapangan. |
| Buffer Analyzer | Lingkaran geometri Leaflet pada radius 500–1.000 m. | Penyegaran hasil mengikuti radius; network analysis bila ingin menyebut jangkauan jalan kaki aktual. |
| Trend Dashboard | Tampilan grafik masih berupa kotak placeholder di detail stasiun. | Deret historis, horizon prediksi bila data cukup, serta pembedaan observasi dan prediksi. |
| AI Insight/Smart Query | Narasi detail stasiun ditulis langsung di JSX; service LLM kosong. | Konteks analisis terstruktur, query, respons yang terkait lokasi, dan fallback ketika layanan gagal. |

### 5. Detail stasiun memuat narasi contoh yang sama untuk lokasi berbeda

[StationDetail](../frontend/src/pages/StationDetail.tsx) mencari stasiun berdasarkan ID, tetapi narasi AI selalu membahas Cisauk, breakdown tetap 88/78/90/75, dan pembanding selalu Serpong. Pengguna yang membuka stasiun lain dapat membaca kesimpulan yang tidak sesuai lokasinya. Foto dan grafik juga masih placeholder.

Data analisis perlu diikat ke ID stasiun. Selama belum tersedia, tampilkan status belum tersedia; narasi contoh tidak boleh tampak seperti hasil analisis untuk lokasi yang sedang dipilih.

### 6. Navigasi dan responsivitas di luar auth masih perlu dituntaskan

- Dashboard menautkan `/dashboard/trend`, `/dashboard/typology`, dan `/dashboard/survey`, tetapi route tersebut belum didefinisikan.
- Tombol `Jelajahi Peta` pada CompareSection dan `Cek Detail` pada StationCard belum mempunyai navigasi.
- Komponen landing masih memuat lorem ipsum, angka statistik yang ditulis langsung di source, dan formulir subscribe tanpa handler.
- Panel peta memakai lebar tetap `w-80`, ditempatkan di kiri/kanan, sedangkan header berisi dua tombol panjang. Berdasarkan struktur ini ada risiko tumpang tindih pada mobile; halaman peta belum diperiksa secara visual dalam pekerjaan auth ini.
- `StationDetail` memakai grid dua kolom dan tab besar tanpa breakpoint. Perlu pemeriksaan viewport kecil tersendiri.
- Nama produk pada aria-label Home masih `Transport Connectivity Insight`, berbeda dari `Transit Commerce Intelligence` dalam PRD.

### 7. Integrasi, performa, dan dokumentasi deployment

- Route frontend diimpor secara eager di App; bundling Vite menghasilkan JavaScript utama sekitar 675 kB sebelum gzip dan peringatan chunk >500 kB. Peta serta dashboard dapat menjadi kandidat pemisahan bundle per route.
- Gambar `home-bg.png` sekitar 2,2 MB dalam output build. Pertimbangkan optimasi gambar setelah kebutuhan visual ditetapkan.
- README menyebut Node 18+, sedangkan package Vite yang terpasang meminta Node `^20.19.0 || >=22.12.0`.
- README baru mencantumkan `VITE_CARTO_API_KEY` untuk frontend, sedangkan source auth juga membutuhkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
- Variabel frontend untuk produksi perlu tersedia saat build Vite. Environment pada container Nginx yang hanya menyajikan file hasil build tidak otomatis mengubah nilai yang telah dibundel.
- Docker development belum meneruskan `--host 0.0.0.0` pada perintah Vite. Pemetaan port perlu diverifikasi dari luar container.
- Backend saat ini memakai `app.listen`; kesiapan deployment Vercel perlu diverifikasi tersendiri, termasuk entry point API, environment, dan SPA routing frontend.

## Validasi perubahan

- Browser headless Microsoft Edge: **26 kombinasi halaman/viewport lulus** (login dan register pada 13 ukuran; lebar 320, 360, 375, 390, 430, 640, 768, 844, 1024, 1366, 1440, 1920, dan 2670 px). `scrollWidth` dokumen/body sama dengan lebar viewport dan scroll horizontal tetap nol. Link bawah tetap terjangkau, termasuk pada viewport pendek/landscape.
- Pembuktian penyebab pada viewport 390 px: melepas pembatas dekorasi membuat lebar scroll **518 px**; dengan pembatas lebar tetap **390 px**. Selisihnya tepat 128 px, sesuai offset dekorasi.
- Pemeriksaan interaksi lokal: pesan password tidak cocok, toggle password/konfirmasi, dan ukuran teks root 200% tetap tidak membuat halaman melebar. Tidak ada error JavaScript halaman; tidak dilakukan registrasi akun atau pengiriman kredensial ke layanan auth nyata.
- Preferensi reduced motion diperiksa pada kedua halaman: computed `animation-name` adalah `none`, dengan lebar dokumen tetap 320 px. Override dibuat penting karena animasi global didefinisikan di luar cascade layer Tailwind.
- Frontend: **21/21 test lulus** pada dua suite login/register. Ada warning `act(...)` pada test loading yang sudah ada.
- Backend: **13/13 test lulus** pada empat suite middleware. Suite bernama API Integration memanggil middleware dengan mock request/response; hasil ini belum membuktikan integrasi HTTP atau Supabase nyata.
- Lint khusus `AuthLayout.tsx`, `Login.tsx`, dan `Register.tsx`: **lulus**.
- Bundling Vite terpisah: **lulus**, output disimpan di folder sementara; ada peringatan ukuran bundle.
- Build penuh: **gagal pada masalah TypeScript di luar perubahan auth**, sebagaimana dirinci di atas.
- Lint seluruh frontend: **7 error** di CountUp, Layout, EkonomiKawasan, dan PropertiTOD; tidak ada pada file auth yang diubah.
- Pemeriksaan whitespace patch: **lulus**.

## Urutan pengerjaan berikutnya

1. Pulihkan build dengan menyelaraskan tipe data, navbar, dan konfigurasi test.
2. Tuntaskan alur auth dan route yang ditautkan, dengan batas jelas antara akses publik dan area akun.
3. Benahi sinkronisasi filter/request POI agar satu stasiun, kategori, dan radius selalu menghasilkan data yang konsisten.
4. Tentukan satu kontrak data stasiun + indikator + sumber/periode + hasil survei; hubungkan ke API/database.
5. Selesaikan satu alur analisis end-to-end memakai data nyata: pilih stasiun → lihat kawasan → baca skor/breakdown atau hotspot → validasi terhadap observasi.
6. Tambahkan model yang didukung dataset dan gunakan LLM untuk menjelaskan output terukur.
7. Selesaikan responsivitas peta, route tersisa, dokumentasi, dan verifikasi deployment.
