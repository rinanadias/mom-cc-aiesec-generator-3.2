# MoM Check-In Call Generator — AIESEC in UI

Aplikasi buat generate MoM (Minutes of Meeting) Check-In Call secara otomatis dari form, sesuai template resmi, langsung jadi PDF, siap diarahkan ke Sign.com buat tanda tangan.

## Cara pakai (setelah di-deploy)

1. Isi form: pilih 1 EP, pilih General Notetaker, centang attendee lain yang hadir, isi info meeting, isi topic/sub-topic/bullet, isi meeting result, upload foto dokumentasi.
2. Klik **"Generate PDF & Lanjut ke Sign.com"**.
3. PDF otomatis ke-download ke device kamu, dan tab baru otomatis kebuka ke sign.com.
4. Di sign.com, upload PDF yang baru ke-download tadi, atur signee (urutan udah otomatis dihitung di dalam PDF-nya: role tertinggi yang hadir → General Notetaker → EP).

## Cara update daftar orang (staff & EP)

Kalau ada pergantian kepengurusan atau EP baru, kamu **cukup edit 1 file** ini, nggak perlu ubah apa pun yang lain:

```
lib/people.js
```

- `STAFF` — daftar General Notetaker / LCVP / Team Leader / Team Member. Tiap orang punya `name`, `title` (yang muncul di PDF), dan `role` (harus persis salah satu dari `ROLE_ORDER`).
- `EPS` — daftar Exchange Participant.
- `ROLE_ORDER` — urutan hierarki dari paling tinggi ke paling rendah. Kalau ada role baru (misal "VP"), tambahin ke array ini sesuai posisi hierarkinya.

Setelah edit file ini, tinggal push ke GitHub — Vercel otomatis re-deploy.

## Cara jalanin di komputer sendiri (opsional, buat testing)

```bash
npm install
npm run dev
```
Buka http://localhost:3000

## Cara deploy ke Vercel

1. Push folder ini ke repo GitHub (bisa private repo punya organisasi/pribadi).
2. Buka https://vercel.com → New Project → Import repo tadi.
3. Vercel otomatis detect ini project Next.js, tinggal klik **Deploy** (tidak perlu setting environment variable apa pun).
4. Setelah selesai, kamu dapat link (misal `mom-generator.vercel.app`) yang bisa dipakai tim kapan aja.

## Struktur project

```
app/
  page.js              -> halaman form utama
  api/generate-pdf/    -> API route yang generate PDF (pakai headless Chromium)
lib/
  people.js            -> [EDIT DI SINI kalau ganti orang] daftar staff & EP
  momLogic.js           -> logic sorting attendance & penentuan signer
  buildHtml.js          -> template HTML yang di-convert jadi PDF
```
