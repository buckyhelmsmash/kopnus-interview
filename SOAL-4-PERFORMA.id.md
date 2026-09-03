# Soal 4 — Studi Kasus Performa

## Proyek asal cerita ini

Contoh di bawah saya ambil dari aplikasi produksi yang benar-benar saya kerjakan: sebuah platform pengembangan UMKM. Aplikasi web yang berat di sisi dashboard, tempat pelaku usaha kecil mengelola program mereka, sementara staf meninjau dan membuat laporannya. Banyak halamannya berupa dashboard lebar penuh widget (grafik, editor teks kaya, peta), persis jenis halaman yang digambarkan soal ini.

Stack yang relevan di sini: Next.js 15.3.3 (App Router, Turbopack), React 19, TanStack Query, Zustand untuk auth. Lalu tersangka biasa saat dashboard terasa berat: dua library grafik (`react-apexcharts` dan `recharts`), editor teks kaya (`lexical` dan `@tiptap`), serta library peta (`maplibre-gl`).

Kontribusi saya ada di lapisan data fetching. Saya memindahkan tim dari panggilan `fetch` yang berserakan di tiap komponen ke sebuah **stack TanStack Query berlapis** yang kecil. Bentuknya sama seperti yang saya pakai di repo interview ini (`src/lib/query/`), dan `ApiClient` aslinya bisa dibaca di `src/lib/query/api-client.ts`.

### Arsitektur fetching (tiga lapis, tiap lapis tahu satu hal)

- **`ApiClient`** — satu pembungkus tipis di atas `fetch`, satu-satunya tempat yang tahu cara membuat request. Ia melempar error saat gagal (supaya `useQuery`/`useMutation` bisa memunculkan error itu), dan di aplikasi produksi ia juga menempelkan token login ke setiap request serta membuka amplop `{ result: ... }` dari API. (`ApiClient` di repo interview ini file yang sama, dikurangi auth dan amplop, karena mock CashEase tidak punya keduanya. Lihat catatan cakupan di bagian atas `api-client.ts`.)
- **Query-key factory + hooks** — satu-satunya tempat aturan caching tinggal. Cache key yang stabil per resource, `useQuery` untuk membaca, `useMutation` untuk menulis, dengan invalidasi saat sukses.
- **Komponen** — meminta `data`/`isLoading`/`error` ke sebuah hook, dan tidak memegang logika fetching sama sekali.

Kenapa saya bangun ini: fetching berserakan, tiap komponen menjalankan request-nya sendiri, dan data sering tidak segar setelah simpan sampai halaman di-reload manual. Satu pintu masuk membuat debugging jadi mudah, dan cache key yang stabil menjaga data tetap segar. Alat yang saya andalkan untuk mengejar masalah cache adalah TanStack Query Devtools, panel kecil yang menampilkan kondisi tiap request yang tersimpan.

## Ringkasan gejala

> **Scenario:** Aplikasi sudah digunakan oleh 100.000 users. Setelah release terbaru, beberapa user melaporkan bahwa halaman dashboard sangat lambat. API response hanya membutuhkan 200 ms, tetapi halaman membutuhkan 5–8 detik untuk tampil.

API balik dalam 200 milidetik tapi halaman butuh 5 sampai 8 detik untuk muncul. Backend-nya cepat, jadi masalahnya ada di sisi klien, di browser. Angka 200 ms itu cuma waktu server memproses satu request. Ia tidak bicara soal berapa banyak request dirangkai berurutan, berapa banyak JavaScript yang harus diunduh dan diproses sebelum ada yang muncul, dan berapa kali halaman menggambar ulang dirinya. Tiga hal itu tempat 5 detik yang hilang bersembunyi.

## 1. Yang saya cek lebih dulu

> **Pertanyaan:** Apa yang akan kamu cek terlebih dahulu?

Saya mulai dari yang paling murah dilihat.

Pertama, waterfall Network di Chrome DevTools. Tab Network mendaftar tiap request yang dibuat halaman dan menggambarnya sebagai batang di garis waktu, jadi kelihatan mana yang saling menunggu. Pertanyaannya: 200 ms itu satu request, atau dashboard menembakkan selusin request beruntun? Dashboard kami penuh widget, dan tiap widget mengambil datanya sendiri. Kalau request-request itu saling menunggu alih-alih jalan bersamaan, 12 request kali 200 ms plus jeda jaringan sudah beberapa detik sendiri.

Kedua, ukuran dan waktu JavaScript. Turbopack cepat saat development, tapi versi yang dikirim ke user asli bisa jauh lebih berat. Grafik, editor, dan peta itu besar, dan gampang terlewat kalau cuma dites di lokal.

Ketiga, saya pastikan letak lambatnya. Lambat cuma di load pertama menunjuk ke unduhan besar atau rantai request. Lambat tiap kali ganti filter atau pindah tab menunjuk ke halaman yang menggambar ulang lebih dari seharusnya.

Keempat, karena soal bilang "setelah release terbaru", saya bandingkan kode release sebelumnya dengan yang sekarang pakai `git diff`. Ada library berat yang menyelinap masuk? Ada data hook yang mulai refetch berulang? Ada komponen yang kehilangan optimasi penahan gambar ulang? Regresi biasanya muncul tepat di sini.

## 2. Membedakan frontend dan backend

> **Pertanyaan:** Bagaimana membedakan masalah frontend dan backend?

| Sinyal | Vonis |
|---|---|
| Waktu respons API sendiri di tab Network memang besar | Backend |
| Server lama mengirim byte pertama, tapi unduhannya sendiri cepat | Backend atau jaringan |
| Tiap panggilan API 200 ms tapi ada 15, satu demi satu | Frontend (cara request diatur) |
| Mengunduh dan menjalankan JavaScript makan waktu lama | Frontend (ukuran bundle atau gambar ulang) |
| Server balik cepat tapi menjalankan JavaScript mendominasi rekaman | Frontend |

Cara tercepat memisah keduanya: buka tab Network dan baca garis waktu per request. Kalau tiap request memang 200 ms seperti klaim soal, backend sehat. Yang tersisa: berapa request yang menembak, kapan mereka menembak, dan seberat apa JavaScript-nya. Semua itu wilayah frontend.

Ini bukan teori buat saya. Sebelum kami memusatkan ke `ApiClient` plus TanStack Query, beberapa halaman memukul endpoint yang sama beberapa kali karena tiap komponen fetch sendiri tanpa cache bersama. Begitu pindah ke hooks bersama, request-request duplikat itu hilang. Dua komponen yang minta data sama runtuh jadi satu request. Itu dedup bawaan TanStack sedang bekerja.

## 3. Tools yang saya pakai

> **Pertanyaan:** Tools apa yang akan digunakan? (sebutkan yang spesifik untuk React/Next.js: React DevTools Profiler, Chrome DevTools Performance, Lighthouse, bundle analyzer, dsb.)

Tab Network Chrome DevTools untuk garis waktu request, jumlah request, lama tiap request, ukurannya, dan mengendus duplikat atau rantai.

Tab Performance Chrome DevTools. Kamu tekan rekam, reload halaman, dan ia menggambar garis waktu semua yang dilakukan browser, terpecah jadi menjalankan JavaScript, menyusun layout, dan mengecat piksel. Ia juga menandai "long task", satu potongan kerja yang memblokir halaman terlalu lama.

React DevTools Profiler untuk merekam satu interaksi dan melihat komponen mana yang menggambar ulang, berapa kali, dan kenapa. Nyalakan "Record why each component rendered", itu setelan yang benar-benar berguna.

TanStack Query Devtools untuk mengamati kondisi tiap request tersimpan (segar, basi, atau sedang fetch), apakah ada yang refetch berulang, dan apakah cache key-nya stabil. Ini senjata utama saya waktu memburu bug "data tidak segar setelah simpan".

`@next/bundle-analyzer`, alat yang menggambar peta JavaScript kamu berdasarkan ukuran supaya kelihatan library mana yang bikin gemuk.

Lighthouse, alat bawaan Chrome yang memberi skor kecepatan muat halaman. Saya jalankan sebelum dan sesudah perbaikan supaya punya angka yang bisa dibandingkan, bukan menebak. Ia melaporkan hal seperti berapa lama sampai user melihat konten utama di layar, dan berapa lama halaman beku tidak bisa merespons klik.

Perintah `next build` juga mencetak tabel berapa banyak JavaScript yang dikirim tiap halaman, langsung di terminal, jadi jangan dilewat.

## 4. Yang saya lihat di Chrome DevTools

> **Pertanyaan:** Apa yang akan dicek di Chrome DevTools?

Di tab Network saya memburu tiga temuan: apakah request jalan bersamaan atau menunggu dalam rantai, file JavaScript mana yang terbesar, dan request mana yang macet karena browser membatasi jumlah yang jalan sekaligus.

Di tab Performance saya memburu long task, potongan kerja yang membekukan halaman lebih dari sekejap, biasanya JavaScript berat atau gambar ulang besar, lalu membaca berapa banyak waktu masuk ke menjalankan JavaScript versus menggambar. Kalau JavaScript mendominasi, itu targetnya. Rekaman juga menunjukkan berapa lama halaman beku sebelum bisa merespons klik.

Tab Coverage sering terlupa padahal berguna. Ia menunjukkan berapa banyak JavaScript terunduh yang tidak pernah benar-benar dijalankan halaman. Kalau grafik, editor, dan peta semuanya terunduh padahal bagian atas layar cuma menampilkan beberapa angka, itu kandidat kuat untuk dimuat belakangan alih-alih di depan.

## 5. Mengecek ukuran JavaScript di Next.js

> **Pertanyaan:** Bagaimana cara mengecek JavaScript bundle di proyek Next.js?

Mulai dari keluaran `next build`. Ia mencetak berapa banyak JavaScript yang dimuat tiap halaman, dan halaman dashboard yang jauh lebih gemuk dari yang lain langsung menonjol.

Setelah itu pakai `@next/bundle-analyzer`. Bungkus `next.config.ts`:

```ts
import withBundleAnalyzer from '@next/bundle-analyzer'
const analyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default analyzer(nextConfig)
```

Jalankan `ANALYZE=true next build`, lalu baca peta ukuran yang ia buka di browser. Cari library besar yang termuat di tampilan halaman pertama padahal tidak perlu. Di proyek kami tersangka utamanya library grafik, editor, dan peta. Tab Coverage memastikan mana dari itu yang benar-benar jalan di dashboard dan mana yang cuma ikut menumpang.

Perbaikan yang saya ambil:

Muat komponen berat hanya saat dibutuhkan, bukan di depan. Di Next.js itu `dynamic()`:

```ts
const ProgramChart = dynamic(() => import('./program-chart'), { ssr: false, loading: () => <ChartSkeleton /> })
```

Grafik, editor, dan peta tidak pantas ada di hal pertama yang diunduh user. Muat saat diminta.

Pastikan satu halaman pakai satu library grafik, bukan `apexcharts` dan `recharts` di halaman yang sama. Itu jebakan klasik yang gampang lolos review.

Impor hanya bagian library yang kamu pakai, `import debounce from 'lodash/debounce'`, bukan seluruhnya dengan `import _ from 'lodash'`.

## 6. Menemukan gambar ulang yang tidak perlu dan memperbaikinya

> **Pertanyaan:** Bagaimana cara menemukan unnecessary rendering (re-render) dan cara memperbaikinya?

Ketika React menggambar ulang komponen yang tidak perlu, halaman kerja ekstra untuk hasil nihil. React menyebutnya re-render. Ada dua cara menemukan yang boros.

Pertama, React DevTools Profiler. Nyalakan "Highlight updates when components render" dan "Record why each component rendered", lalu rekam sambil mengganti filter atau tab. Kalau satu klik filter menggambar ulang selusin widget yang datanya tidak berubah, itu kerja sia-sia.

Kedua, TanStack Query Devtools. Kalau satu request tersimpan terus fetch padahal tidak ada yang meminta, cache key-nya biasanya tidak stabil. Begini maksudnya. TanStack Query mengenali tiap request tersimpan lewat sebuah "key", dan kalau key itu terlihat beda di tiap render, TanStack mengira ini request baru dan fetch lagi. Ini terjadi ketika key memuat objek atau array yang dibangun baru tiap kali:

```ts
useQuery({ queryKey: ['someList', { id, filter: { date } }], ... })
```

Objek `filter` itu objek baru di tiap render walau `date`-nya sama, jadi key-nya tidak pernah dianggap sama. Ini persis kelas bug yang saya tangani waktu membenahi fetching.

Beberapa penyebab yang benar-benar saya temui di proyek ini:

Cache key tidak stabil, seperti di atas. Perbaikannya: bangun key dari nilai polos (string, angka) alih-alih objek baru, atau bungkus pakai `useMemo` supaya React memakai ulang objek yang sama antar gambar ulang. Ini juga alasan saya memindahkan pembangunan query-parameter ke satu helper bersama, supaya bentuknya konsisten dan tidak melahirkan objek baru sembarangan.

Mengoper objek atau fungsi baru ke komponen anak di tiap gambar ulang, yang menggagalkan optimasi yang seharusnya melewatinya. Perbaikannya `useCallback` untuk fungsi dan `useMemo` untuk objek, keduanya memakai ulang nilai yang sama antar gambar ulang.

Komponen yang berlangganan ke seluruh store bersama menggambar ulang begitu ada perubahan apa pun. Perbaikannya: berlangganan hanya ke potongan yang kamu butuh, `useAuthStore(s => s.token)` bukan mengambil semuanya.

State ditaruh terlalu tinggi di pohon. Kalau state filter tinggal di parent, mengubahnya menggambar ulang seluruh cabang di bawahnya. Dorong state itu sedekat mungkin ke tempat ia dipakai.

Satu catatan: React 19 dengan compiler barunya menghapus banyak kerja manual di atas, tapi cache key yang stabil dan langganan store yang sempit tetap tanggung jawabmu. Compiler tidak menutup dua hal itu.

## 7. Membuktikan sebuah fix benar-benar mempercepat, bukan cuma terasa cepat

> **Pertanyaan:** Bagaimana memastikan fix yang dibuat benar-benar meningkatkan performa? (wajib berikan contoh pengukuran sebelum/sesudah dari pengalaman nyata.)

Aturan yang saya pegang: jangan pernah bilang "lebih cepat" tanpa angka. Ukur dengan cara sama pada kondisi sama (Lighthouse bisa mensimulasikan ponsel lambat dan jaringan lambat, jadi angkanya jujur dan bisa diulang), rekam sebelum, terapkan fix, rekam sesudah.

### Contoh nyata dari proyek ini (kerja yang benar-benar saya lakukan dan ukur)

Kasusnya: request duplikat dan gambar ulang boros di sebuah halaman list yang saya pindahkan dari fetch manual ke stack `ApiClient` + TanStack Query. Sebelum dipusatkan, tiap komponen memanggil endpoint-nya sendiri tanpa cache bersama, dan setelah simpan data sering tidak segar sampai reload penuh. Yang saya ukur di tab Network dan React Profiler:

| Metrik | Sebelum | Sesudah | Cara ukur |
|---|---|---|---|
| Request saat membuka halaman list | ~11 (banyak duplikat endpoint yang sama) | ~4 | Tab Network, menghitung request |
| Request duplikat ke endpoint sama | ya, 3 sampai 4 kali | 0, digabung TanStack Query | Tab Network plus Query Devtools |
| Kesegaran data setelah create atau update | tidak konsisten, kadang perlu reload manual | otomatis, simpan menyuruh cache menyegarkan | Query Devtools, mengamati request jadi basi lalu refetch |
| Gambar ulang saat pindah halaman | seluruh list menggambar ulang | hanya baris yang berubah | React Profiler |

Fix pindah-halaman datang dari menyuruh TanStack Query tetap menampilkan data halaman sebelumnya selagi yang berikutnya dimuat, plus melacak nomor halaman secara lokal. Hasilnya, berpindah antar halaman tidak mengedip ke layar loading penuh dan tidak menggambar ulang seluruh tabel.

### Membuktikan fix bundle untuk gejala di soal (metode, bukan hasil kerja solo)

Satu pembedaan jujur: angka halaman list di atas kerja yang saya lakukan dan ukur sendiri. Dashboard 5–8 detik itu skenario yang soal ini karang. Saya tidak pernah mengirim fix dashboard terukur dari 8 detik ke bawah 2,5 detik sebagai hasil kerja solo. Jadi di sini saya tunjukkan metode yang akan saya jalankan, diambil dari tooling proyek yang sama dan fix dynamic import yang sudah saya terapkan ke halaman-halaman berat di sana:

Ambil baseline dulu. Jalankan `next build`, catat berapa banyak JavaScript yang dimuat halaman dashboard, lalu jalankan Lighthouse dengan simulasi ponsel lambat dan catat angka kecepatannya.

Terapkan fix. Muat grafik, editor, dan peta saat diminta. Pakai satu library grafik. Buat request yang independen jalan bersamaan alih-alih dalam rantai. Stabilkan cache key.

Ukur lagi dengan setelan identik.

Batas lulusnya jelas. JavaScript dashboard turun banyak, user melihat konten utama di bawah 2,5 detik, dan waktu beku turun tajam. Kalau angkanya tidak bergerak, fix-nya belum benar dan tidak boleh di-merge. Buat saya ini bukan formalitas. Merge tanpa angka cuma mendorong masalah ke release berikutnya.

Laporan yang saya kirim ke tim selalu berbentuk sama: satu tabel sebelum/sesudah dengan tools dan angkanya, plus tangkapan layar sebelum-sesudah dari rekaman Performance supaya long task yang hilang terlihat mata.

## Ceklis cepat

- [ ] Cek garis waktu Network. Satu request atau banyak dalam rantai?
- [ ] Cek rekaman Performance. Long task dan berapa banyak waktu masuk ke JavaScript.
- [ ] `next build` plus `@next/bundle-analyzer`. Buru library berat di load halaman pertama.
- [ ] Muat grafik, editor, dan peta saat diminta, dan pakai satu library grafik per halaman.
- [ ] React Profiler plus Query Devtools. Kejar gambar ulang boros dan cache key tidak stabil.
- [ ] Ukur sebelum dan sesudah pakai Lighthouse plus `next build` pada setelan identik, lampirkan angkanya.
