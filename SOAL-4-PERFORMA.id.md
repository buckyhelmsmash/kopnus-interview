# Soal 4 — Studi Kasus Performa

> **Scenario:** Aplikasi sudah digunakan oleh 100.000 users. Setelah release terbaru, beberapa user melaporkan bahwa halaman dashboard sangat lambat. API response hanya membutuhkan 200 ms, tetapi halaman membutuhkan 5–8 detik untuk tampil.

## Real Proyek asal jawaban ini

Contoh di bawah saya ambil dari aplikasi produksi yang saya kerjakan: sebuah platform digitalisasi Program Magang mahasiswa pada sebuah UMKM.  Banyak halamannya berupa dashboard penuh widget seperti chart, editor teks, dan peta, mirip halaman yang disebut di soal.

Stack yang dipakai: Next.js 15.3.3 (App Router, Turbopack), React 19, TanStack Query, Zustand. Library yang biasanya bikin dashboard berat: dua library chart (`react-apexcharts` dan `recharts`), editor teks (`lexical` dan `@tiptap`), dan library peta (`maplibre-gl`).

Kontribusi saya ada di lapisan data fetching. Saya merefactor dari `fetch` yang berserakan di tiap komponen menjadi terpusat dan diberi penanda tiap query untuk memudahkan manajemen. Bentuknya sama seperti yang saya pakai di repo interview ini (`src/lib/query/`), dan `ApiClient` aslinya bisa dibaca di `src/lib/query/api-client.ts`. Tiga lapis, tiap lapis tahu satu hal:

- **`ApiClient`** — pembungkus tipis di atas `fetch`, satu-satunya tempat yang tahu cara membuat request.  throw error saat gagal supaya `useQuery`/`useMutation` bisa menampilkannya. Di aplikasi produksi juga menempelkan token login ke tiap request dan membuka amplop `{ result: ... }` dari API. (`ApiClient` di repo interview ini file yang sama, dikurangi auth dan amplop, karena mock CashEase tidak punya keduanya.)
- **Query-key factory + hooks** — Reusable hooks dan manajemen key yang terpusat. Cache key stabil per resource, `useQuery` untuk baca, `useMutation` untuk tulis, dengan invalidasi saat sukses.
- **Komponen** — minta `data`/`isLoading`/`error` ke hook, tidak memegang logika fetching sama sekali.
- **Menghilankan Request ganda atau berulang** 

## Jawaban

Setelah saya pelajari, sub-pertanyaan 1 sampai 7 saling berkaitan. Kalau dijawab per point jawabannya akan berulang, jadi saya rangkum jadi satu alur.

### Yang saya cek dahulu

Dari pertanyaan, bug terjadi di halaman dashboard. Asumsi saya, dashboard pada umumnya punya lebih dari satu komponen chart atau diagram yang berat, contohnya peta berbasis canvas atau chart. Untuk hidrasi data tiap komponen di dashboard, kemungkinan ada dua cara: bisa dalam satu API request yang merespons data untuk keseluruhan komponen, atau tiap komponen memanggil API sendiri-sendiri.

Klaim di soal, response API hanya 200 ms tapi load halaman dashboard sampai 5-8 detik. Kalau pakai cara pertama dan load masih makan 5-8 detik, kemungkinan komponen diagram di dashboard ukurannya terlalu besar. Kalau pakai cara kedua dan makan 5-8 detik, kemungkinan ada cacat logika di pemanggilan fungsi fetching yang tidak jalan paralel melainkan saling menunggu. Untuk mengeceknya bisa dilihat dari timeline network waterfall di Chrome DevTools, untuk tiap request API maupun loading page-nya.

Untuk komponen berukuran besar yang butuh waktu lama untuk load, bisa ditangani dengan dynamic import dan placeholder komponen dulu.

Karena bug terjadi setelah rilisan terbaru, saya bisa cek pakai `git diff`, di bagian mana yang berubah, apakah ada penambahan library baru yang bikin berat.

### Membedakan masalah frontend dan backend

Masalah backend: kalau dilihat dari timeline network respons API-nya lama, jelas itu masalah backend.

Masalah frontend: respons API 200 ms tapi ada 10 request saling tunggu, atau download JavaScript di halaman lama atau berkali-kali.

Sebelum kami memusatkan ke `ApiClient` plus TanStack Query, beberapa halaman memukul endpoint yang sama beberapa kali karena tiap komponen fetch sendiri tanpa cache bersama. Begitu pindah ke hooks bersama, request duplikat itu hilang, dua komponen yang minta data sama digabung jadi satu request oleh dedup bawaan TanStack.

### Tools yang digunakan

- **Chrome DevTools Network tab** — cek timeline request, jumlah request, lama request, ukuran request, dan request duplikat.
- **Chrome DevTools Performance tab** — lihat task browser di halaman yang dikunjungi seperti rendering layout, pixel painting, JavaScript task, timeline frame dan animasi. Otomatis mendeteksi task mana yang lama atau berat.
- **React DevTools** — cek rendering tiap komponen.
- **TanStack Query Devtools** — cek cache dari tiap request.
- **Chrome Lighthouse** — scoring page load speed, untuk pembanding apakah ada peningkatan sebelum dan sesudah fixing.
- **`next build`** — setelah build selesai juga dilampirkan berapa ukuran JavaScript tiap page.
- **`@next/bundle-analyzer`** — cek ukuran library JavaScript mana yang besar.

### Yang dicek di Chrome DevTools

Di Network tab saya cek apakah request jalan paralel atau saling tunggu dalam rantai, file JavaScript mana yang paling besar, dan request mana yang macet karena browser membatasi jumlah request yang jalan sekaligus.

Di Performance tab saya cari long task, potongan kerja yang membekukan halaman lebih dari sekejap, biasanya JavaScript berat atau re-render besar. Saya juga baca berapa banyak waktu yang masuk ke menjalankan JavaScript versus rendering. Kalau JavaScript dominan, itu targetnya.

Coverage tab juga berguna, ia menunjukkan berapa banyak JavaScript terunduh yang tidak pernah dijalankan halaman. Kalau chart, editor, dan peta terunduh semua padahal bagian atas layar cuma menampilkan beberapa angka, itu kandidat kuat untuk dimuat belakangan.

### Cek JavaScript bundle di Next.js

Dulu output `next build` mencetak ukuran JavaScript tiap halaman, dan halaman dashboard yang jauh lebih besar langsung kelihatan. Tapi Next 16 sudah menghapus kolom `size` dan `First Load JS` dari output build karena dianggap tidak akurat di arsitektur server-driven (RSC), dan implementasi Turbopack vs Webpack beda hitungannya. Jadi ukuran JS sekarang diambil dari dua tempat: `@next/bundle-analyzer` untuk lihat *library mana* yang berat, dan Network tab browser untuk angka *transfer aslinya*.

Untuk peta library pakai `@next/bundle-analyzer`. Wrap `next.config.ts`:

```ts
import withBundleAnalyzer from '@next/bundle-analyzer'
const analyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default analyzer(nextConfig)
```

Jalankan `ANALYZE=true next build`, lalu baca peta ukuran yang dibuka di browser. Cari library besar yang termuat di tampilan halaman pertama padahal tidak perlu. Di proyek kami tersangka utamanya library chart, editor, dan peta.

(Catatan: cara di atas dari project lama yang masih webpack. Di Next 16 defaultnya Turbopack, dan `@next/bundle-analyzer` cuma jalan di build webpack. Instruksi lengkap untuk kedua build ada di bagian "Cek ukuran bundle" di bawah.)

Fixing yang saya ambil:

Muat komponen berat hanya saat dibutuhkan, bukan di depan. Di Next.js itu `dynamic()`:

```ts
const ProgramChart = dynamic(() => import('./program-chart'), { ssr: false, loading: () => <ChartSkeleton /> })
```

Pastikan juga satu halaman pakai satu library chart, bukan `apexcharts` dan `recharts` di halaman yang sama. Dan impor hanya bagian library yang dipakai, `import debounce from 'lodash/debounce'`, bukan seluruhnya dengan `import _ from 'lodash'`.

### Menemukan unnecessary re-render dan memperbaikinya

Untuk menemukan re-render yang tidak perlu saya pakai React DevTools dan TanStack Query Devtools.

Di React DevTools Profiler, nyalakan "Highlight updates when components render" dan "Record why each component rendered", lalu rekam sambil ganti filter atau tab. Kalau satu klik filter menyebabkan selusin widget re-render padahal datanya tidak berubah, itu kerja sia-sia.

Di TanStack Query Devtools, kalau satu request tersimpan terus fetch padahal tidak ada yang minta, cache key-nya biasanya tidak stabil. TanStack Query mengenali tiap request tersimpan lewat sebuah key, dan kalau key itu beda di tiap render, TanStack mengira itu request baru dan fetch lagi. Ini terjadi kalau key memuat objek atau array yang dibangun baru tiap kali:

```ts
useQuery({ queryKey: ['someList', { id, filter: { date } }], ... })
```

Objek `filter` itu objek baru di tiap render walau `date`-nya sama, jadi key-nya tidak pernah dianggap sama.

Beberapa penyebab yang saya temui di proyek ini:

- Cache key tidak stabil, seperti di atas. Fixing-nya bangun key dari nilai polos (string, angka) alih-alih objek baru, atau wrap pakai `useMemo`. Ini juga alasan saya memindahkan pembangunan query-parameter ke satu helper bersama, supaya bentuknya konsisten.
- Mengoper objek atau fungsi baru ke komponen anak di tiap render, yang membatalkan optimasi yang harusnya melewatinya. Fixing-nya `useCallback` untuk fungsi dan `useMemo` untuk objek.
- Komponen yang subscribe ke seluruh store re-render begitu ada perubahan apa pun. Fixing-nya subscribe hanya ke slice yang dibutuhkan, `useAuthStore(s => s.token)` bukan ambil semuanya.
- State ditaruh terlalu tinggi di tree. Kalau state filter tinggal di parent, mengubahnya me-re-render seluruh cabang di bawahnya. Turunkan state itu sedekat mungkin ke tempat ia dipakai.

Catatan: React 19 dengan compiler barunya menghapus banyak kerja manual di atas, tapi cache key yang stabil dan subscribe store yang sempit tetap tanggung jawab kita.

### Memastikan fix benar-benar meningkatkan performa

Aturan yang saya pegang: jangan bilang "lebih cepat" tanpa angka. Bisa dibandingkan dengan score Lighthouse yang didapat sebelum dan sesudah fixing, diukur dengan cara yang sama pada kondisi yang sama (Lighthouse bisa simulasi ponsel lambat dan jaringan lambat, jadi angkanya bisa diulang).

### Demo before/after di repo ini

Karena saya sudah tidak punya akses ke project lama, saya buat ulang skenarionya di repo ini dalam bentuk kecil supaya reviewer bisa cek angkanya sendiri. Dua halaman dengan widget dan mock API yang sama, yang membeda cuma tekniknya:

- **`/dashboard/before`** — sengaja jelek. Tiap widget fetch sendiri via `useEffect` + `fetch` tanpa cache bersama (dua widget menembak `/api/dashboard/stats` masing-masing, jadi kelihatan duplikat di Network), chart dan peta di-import statis, state filter di root, dan chart-nya re-fetch dari nol tiap kali filter diganti (tanpa cache).
- **`/dashboard/after`** — sudah diperbaiki. Shared TanStack Query hooks (dedup lewat `dashboardKeys`), chart dan peta lewat `dynamic({ ssr: false })` plus skeleton, state filter diturunkan ke widget yang butuh, dan cache key dari nilai polos.

Widgetnya mengikuti dashboard project lama: empat stat card, chart tahunan (shadcn/Recharts), dan peta provinsi Indonesia pakai `@vis.gl/react-maplibre` dengan tile carto keyless (tanpa token). Tiap endpoint mock delay 200 ms, cocok dengan klaim "API 200 ms" di soal, jadi selisih waktunya murni dari frontend.

Cara ambil angkanya:

1. `bun run build` untuk build biasa (Turbopack), lalu buka kedua halaman di browser.
2. Untuk lihat ukuran bundle, lihat bagian "Cek ukuran bundle" di bawah.
3. Network tab untuk hitung request dan duplikat di tiap halaman.
4. React DevTools Profiler untuk hitung re-render saat ganti filter tahun.
5. Lighthouse (preset mobile, throttled) di tiap halaman untuk FCP/LCP/TBT.

#### Cek ukuran bundle

Di Next 16 defaultnya Turbopack, jadi ada dua jalan tergantung build mana yang dipakai.

**Turbopack (default).** Pakai analyzer bawaan Next, tidak perlu library tambahan (butuh Next 16.1+):

```sh
# buka server interaktif di browser
bunx next experimental-analyze

# atau tulis file statis ke .next/diagnostics/analyze
bunx next experimental-analyze --output
```

**Webpack.** `@next/bundle-analyzer` sudah saya wire di `next.config.ts` (`withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })`). Ini cuma jalan di build webpack, bukan Turbopack:

```sh
ANALYZE=true bunx next build --webpack
```

Laporannya keluar di `.next/analyze/client.html`. Di kedua cara, yang saya cari sama: library besar yang ikut termuat di first-load `/dashboard` padahal belum kelihatan di layar — di sini tersangkanya `recharts` dan `maplibre-gl`, yang di halaman `after` dipindah ke `dynamic({ ssr: false })` supaya keluar dari bundle awal.

Catatan soal angka: karena Next 16 sudah tidak mencetak `size`/`First Load JS`, angka bundle di tabel bawah saya ambil dari Network tab, bukan dari output build — total JavaScript yang benar-benar terkirim tiap halaman (cache disabled). Di `client.html`, ganti dropdown ukuran ke Gzipped dan bandingkan chunk `/dashboard/before` vs `/dashboard/after`; di situ terlihat `recharts` dan `maplibre-gl` duduk di first-load halaman `before` tapi terpisah di `after`. Kalau analyzer menulis "No bundles were parsed", itu cuma berarti ia jatuh ke stat size (ukuran sebelum minify), tetap cukup untuk banding relatif.

| Metrik | Before | After | Tool |
|---|---|---|---|
| Request API saat load | 5 (termasuk `/stats` 2× duplikat) | 4 (dedup) | Network tab |
| Request duplikat ke endpoint sama | ada, `/stats` ditembak 2× oleh dua widget | tidak ada, dedup + cache TanStack Query | Network tab + Query Devtools |
| JS first-load (blocking, <200ms, gzip) | ~256 KB | ~156 KB | Network tab (performance resource timing) |
| Total JS terkirim (cache disabled, gzip) | ~539 KB | ~542 KB | Network tab + bundle-analyzer |
| Re-render saat ganti filter | ribuan re-render, mayoritas dari internals Recharts + seluruh tree ikut | lebih sedikit, subtree chart saja yang re-render | React Profiler |
| LCP (mobile, throttled) | 2.2 s | 2.1 s | Lighthouse |
| Lighthouse Performance Score (mobile, throttled) | 0.66 | 0.68 | Lighthouse |
| Total Blocking Time (TBT) | 3190 ms | 2498 ms | Lighthouse |

_Semua angka di atas saya ukur di production build (`bun run build` + `bun run start`) dengan Chrome headless. Lighthouse preset perf (mobile + throttling): skor Before 0.66 vs After 0.68, dan TBT turun dari 3190 ms ke 2498 ms — itu signal paling jujur, karena TBT mengukur kerja main-thread yang terblokir, dan di `after` chart+peta tidak lagi memblokir di first-load. LCP sendiri cuma beda tipis (2.2 s vs 2.1 s) karena kedua halaman tetap merender widget yang sama; yang berubah adalah *kapan* JS beratnya dieksekusi, bukan totalnya._

## Ceklis cepat

- [x] Cek timeline Network. Satu request atau banyak yang saling tunggu?
- [ ] Cek rekaman Performance. Long task dan berapa banyak waktu masuk ke JavaScript.
- [ ] Ukur bundle: `next experimental-analyze` (Turbopack) atau `ANALYZE=true next build --webpack` (`@next/bundle-analyzer`), plus total JS terkirim dari Network tab (Next 16 sudah tidak mencetak `size`/`First Load JS`).
- [ ] Muat chart, editor, dan peta saat dibutuhkan, dan pakai satu library chart per halaman.
- [ ] React DevTools plus Query Devtools. Cari re-render boros dan cache key tidak stabil.
- [ ] Ukur sebelum dan sesudah pakai Lighthouse plus `next build` pada setelan yang sama.
