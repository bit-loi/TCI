# Deploy TCI ke Vercel

Repository ini adalah monorepo. Deploy sebagai **dua Vercel Project** dari repository Git yang sama agar routing SPA tidak bertabrakan dengan routing Express.

## 1. Deploy backend

Buat project pertama di Vercel dengan pengaturan berikut:

- Root Directory: `backend`
- Framework Preset: Express (biasanya terdeteksi otomatis)
- Install Command: `npm install` atau default
- Build Command: kosong/default

Tambahkan environment variables berikut melalui **Project Settings → Environment Variables**:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CORS_ORIGINS=https://your-frontend.vercel.app
GEMINI_API_KEY=your-key-if-used
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Jangan memasukkan file `backend/.env` ke Git atau menaruh secret langsung di `vercel.json`.

Setelah deployment selesai, uji endpoint berikut:

```text
https://your-backend.vercel.app/
https://your-backend.vercel.app/api/health
https://your-backend.vercel.app/api/stations
```

## 2. Deploy frontend

Buat project kedua dari repository yang sama:

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Tambahkan environment variables:

```text
VITE_API_URL=https://your-backend.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CARTO_API_KEY=your-carto-key-if-used
```

`frontend/vercel.json` mengarahkan deep link seperti `/dashboard/trend` ke `index.html`, kemudian React Router menangani route dan proteksi autentikasinya.

## 3. Perbarui CORS backend

Setelah URL frontend diketahui, pastikan `CORS_ORIGINS` pada project backend berisi origin frontend secara persis, tanpa path:

```text
CORS_ORIGINS=https://your-frontend.vercel.app
```

Untuk beberapa domain, pisahkan dengan koma:

```text
CORS_ORIGINS=https://tci.example.com,https://your-frontend.vercel.app
```

Redeploy backend setelah mengubah environment variable.

## Deploy memakai CLI

Jalankan dari root repository dengan Vercel CLI versi terbaru:

```bash
npm install --global vercel
vercel link --repo
```

Atau deploy masing-masing direktori secara eksplisit:

```bash
vercel --cwd backend
vercel --cwd frontend
```

Untuk production:

```bash
vercel --prod --cwd backend
vercel --prod --cwd frontend
```

Deploy backend terlebih dahulu agar nilai `VITE_API_URL` frontend sudah diketahui.

## Catatan serverless

- `src/index.js` mengekspor instance Express untuk Vercel dan hanya menjalankan `app.listen()` ketika dieksekusi langsung lewat Node.
- Penyimpanan in-memory tidak dijamin konsisten antar-instance serverless. Rate limiter saat ini tetap menjadi lapisan dasar, tetapi production berskala besar sebaiknya memakai store bersama seperti Redis.
- File system function bersifat sementara. Simpan data persisten di Supabase atau layanan penyimpanan eksternal.
