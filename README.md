# Kalkulator Harga Shopee

Aplikasi mobile-first untuk menghitung harga jual, biaya Shopee, kategori produk,
iklan, titik impas, dan laba bersih. Aplikasi berjalan sebagai Cloudflare Worker
dengan aset statis yang diterbitkan melalui Workers Assets.

## Teknologi

- Next.js App Router melalui Vinext
- React dan TypeScript
- Vite
- Cloudflare Workers dan Workers Assets
- Wrangler
- Penyimpanan skenario pada `localStorage` perangkat

Aplikasi saat ini tidak membutuhkan database, D1, R2, atau secret runtime.

## Persyaratan

- Node.js `22.13.0` atau lebih baru pada jalur Node 22
- npm
- Akun Cloudflare untuk deployment

Versi Node yang direkomendasikan tersedia di `.nvmrc`.

## Menjalankan secara lokal

```bash
npm ci
npm run dev
```

## Perintah penting

| Perintah | Kegunaan |
| --- | --- |
| `npm run lint` | Memeriksa kualitas kode |
| `npm test` | Build, validasi artefak, dan menjalankan tes |
| `npm run check` | Menjalankan lint, build, dan semua tes |
| `npm run build` | Membuat Worker dan aset produksi |
| `npm run preview:cloudflare` | Menjalankan hasil build pada runtime lokal Wrangler |
| `npm run deploy:cloudflare:dry-run` | Memvalidasi paket deployment tanpa menerbitkan |
| `npm run deploy:cloudflare` | Build dan deploy langsung ke Cloudflare |
| `npm run deploy:cloudflare:only` | Deploy artefak yang sudah selesai dibangun |

## Bentuk hasil build

`npm run build` menghasilkan:

- `dist/server/index.js` — entry point Worker ESM;
- `dist/server/wrangler.json` — konfigurasi deployment hasil build;
- `dist/client/` — aset CSS, JavaScript, font, dan file publik;
- `dist/.openai/hosting.json` — identitas deployment ChatGPT Sites.

Gunakan konfigurasi hasil build di `dist/server/wrangler.json`. Proyek sengaja
tidak memakai konfigurasi Wrangler kedua di root agar `nodejs_compat`, Worker
entry point, dan direktori aset tidak didefinisikan dua kali.

## Deploy langsung dari komputer

Login sekali:

```bash
npx wrangler login
```

Validasi tanpa menerbitkan:

```bash
npm run deploy:cloudflare:dry-run
```

Deploy:

```bash
npm run deploy:cloudflare
```

Setelah deployment berhasil, periksa:

```text
https://NAMA-WORKER.SUBDOMAIN.workers.dev/api/health
```

Respons yang benar:

```json
{
  "ok": true,
  "service": "kalkulator-harga-shopee",
  "runtime": "cloudflare-workers"
}
```

## Deploy otomatis setelah merge GitHub

Workflow `.github/workflows/deploy-cloudflare.yml` otomatis berjalan setiap ada
push atau merge ke branch `main`.

Tambahkan dua repository secrets sebelum merge:

1. `CLOUDFLARE_API_TOKEN`
2. `CLOUDFLARE_ACCOUNT_ID`

Token Cloudflare minimal harus memiliki izin mengedit Workers pada akun tujuan.
Jangan menyimpan token dalam source code, `.env`, commit, atau konfigurasi
Wrangler.

Pull request juga diperiksa oleh `.github/workflows/ci.yml` sehingga error lint,
build, konfigurasi Worker, atau health-check dapat diketahui sebelum merge.

## Deploy melalui Cloudflare Workers Builds

Jika repository dihubungkan langsung dari dashboard Cloudflare:

- Production branch: `main`
- Root directory: `/`
- Build command: `npm ci && npm run build`
- Deploy command: `npm run deploy:cloudflare:only`
- Node.js: `22.13.0`

Jangan menambahkan `nodejs_compat` lagi melalui perintah build atau konfigurasi
kedua. Flag tersebut sudah dibuat satu kali dari `vite.config.ts`.

## Custom domain

Setelah Worker berhasil aktif:

1. Buka **Workers & Pages** di Cloudflare.
2. Pilih Worker `kalkulator-harga-shopee`.
3. Buka **Settings → Domains & Routes**.
4. Pilih **Add → Custom Domain**.
5. Masukkan domain atau subdomain yang sudah berada dalam akun Cloudflare.

Custom domain tidak memerlukan perubahan kode.

## Data dan privasi

- Input harga dan skenario tersimpan hanya pada browser/perangkat pengguna.
- Tidak ada data toko yang dikirim ke database proyek.
- CSV dibuat langsung pada browser.
- Secret deployment hanya boleh berada di GitHub Actions atau Cloudflare.

Panduan deployment yang lebih rinci tersedia di
[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md).
