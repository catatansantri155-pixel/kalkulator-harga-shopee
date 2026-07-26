# Panduan Deployment Cloudflare Workers

Dokumen ini adalah checklist deployment untuk repository
`kalkulator-harga-shopee`.

## 1. Persiapan repository

Pastikan file berikut ikut masuk ke GitHub:

- `app/`
- `worker/index.ts`
- `vite.config.ts`
- `package.json`
- `package-lock.json`
- `scripts/`
- `.github/workflows/`
- `.nvmrc`
- `.dev.vars.example`

Jangan commit:

- `node_modules/`
- `dist/`
- `.wrangler/`
- `.sites-runtime/`
- `.env*`
- `.dev.vars`
- API token atau account credential

## 2. Pemeriksaan sebelum push

```bash
npm ci
npm run check
npm run deploy:cloudflare:dry-run
```

Dry-run harus menunjukkan bahwa Worker, modul server, dan direktori aset dapat
dipaketkan tanpa menerbitkannya.

## 3. Membuat API token Cloudflare

Di dashboard Cloudflare:

1. Buka **My Profile → API Tokens**.
2. Buat token untuk deployment Workers.
3. Batasi token hanya pada akun yang digunakan.
4. Berikan izin edit untuk Workers Scripts.
5. Salin token satu kali dan simpan sebagai GitHub secret.

Jangan menggunakan Global API Key bila token dengan cakupan sempit sudah cukup.

## 4. Menambahkan GitHub secrets

Di repository GitHub buka:

**Settings → Secrets and variables → Actions → New repository secret**

Tambahkan:

| Nama secret | Isi |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Token deployment Workers |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID Cloudflare tujuan |

Setelah kedua secret tersedia, merge ke `main` akan:

1. menginstal dependency dari lockfile;
2. menjalankan lint;
3. membangun Worker dan aset;
4. memvalidasi konfigurasi Wrangler;
5. menguji halaman utama dan `/api/health`;
6. menerbitkan Worker.

## 5. Konfigurasi build Cloudflare

Konfigurasi deployment tidak ditulis manual ke root. Vinext dan Cloudflare Vite
Plugin menghasilkan file final:

```text
dist/server/wrangler.json
```

Workflow menerbitkannya dengan:

```bash
wrangler deploy --config dist/server/wrangler.json
```

Konfigurasi final sudah mencakup:

- nama Worker `kalkulator-harga-shopee`;
- entry point `index.js`;
- `compatibility_date`;
- flag `nodejs_compat`;
- binding `ASSETS`;
- direktori aset `../client`;
- observability Worker.

## 6. Verifikasi setelah deploy

Buka URL Worker, lalu cek endpoint:

```text
/api/health
```

Status harus `200` dan respons harus menunjukkan:

```json
{
  "ok": true,
  "service": "kalkulator-harga-shopee",
  "runtime": "cloudflare-workers"
}
```

Periksa juga:

- halaman Dashboard terbuka;
- navigasi Input, Kategori, Iklan, Hasil, dan Skenario berjalan;
- CSS dan font tampil;
- refresh pada URL dengan hash tetap membuka aplikasi;
- skenario lokal dapat disimpan;
- ekspor CSV berjalan.

## 7. Custom domain

Tambahkan domain dari halaman Worker:

**Settings → Domains & Routes → Add → Custom Domain**

Domain harus berada pada zone Cloudflare yang sama. Untuk satu Worker, gunakan
salah satu domain utama atau subdomain yang jelas, misalnya:

```text
kalkulator.namadomain.com
```

## 8. Masalah umum

### `Compatibility flag specified multiple times: nodejs_compat`

Jangan menambahkan flag yang sama melalui konfigurasi lain atau build command.
Proyek sudah mengaturnya di `vite.config.ts`. Gunakan hanya konfigurasi hasil
build `dist/server/wrangler.json`.

### `dist/server/wrangler.json` tidak ditemukan

Jalankan:

```bash
npm run build
```

Jangan menjalankan `deploy:cloudflare:only` sebelum build selesai.

### GitHub Action gagal autentikasi

Periksa bahwa:

- nama secret tepat;
- token belum dicabut;
- token memiliki akses ke akun yang Account ID-nya dimasukkan;
- token memiliki izin mengedit Workers.

### Worker aktif tetapi aset tidak tampil

Pastikan deployment menggunakan konfigurasi:

```text
dist/server/wrangler.json
```

dan bukan menjalankan `wrangler deploy` terhadap `worker/index.ts` secara
langsung. Konfigurasi hasil build menghubungkan `dist/client` sebagai Workers
Assets.

### Aplikasi aktif tetapi data skenario hilang di perangkat lain

Ini perilaku yang diharapkan. Skenario saat ini disimpan pada `localStorage`,
bukan D1. D1 baru diperlukan jika data harus tersinkron antarperangkat atau
antarakun.
