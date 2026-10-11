# Flappy Bird Pixel

Game arcade bergaya pixel art tentang karakter yang terbang melewati tiang kayu di atas desa kecil. Permainan dimulai sederhana, lalu berkembang menjadi lebih cepat dan lebih menantang seiring skor bertambah.


## Gambaran Umum

Flappy Bird Pixel menggunakan Canvas 2D sebagai dunia permainan dan Vue sebagai lapisan antarmuka. Semua objek utama digambar melalui kode sehingga game tidak bergantung pada aset gambar eksternal.

Setiap lima poin, level bertambah dan suasana latar berubah. Kecepatan dunia meningkat, celah antar tiang menyempit, dan mulai skor tertentu beberapa tiang bergerak naik-turun.

## Teknologi

| Teknologi | Peran |
| --- | --- |
| Vue 3 | Menu, skor, status permainan, dan layar game over |
| Vite 7 | Server pengembangan dan proses build |
| TypeScript | Logika game dengan tipe statis |
| Tailwind CSS v4 | Styling antarmuka |
| Canvas 2D | Rendering dunia pixel art |
| Web Audio API | Efek suara 8-bit |
| Press Start 2P | Tipografi antarmuka bergaya arcade |

## Fitur Utama

- Rendering pixel art yang tajam di desktop dan perangkat seluler.
- Background desa dengan langit berpita, matahari, awan, bukit, rumah, pohon, pagar, dan NPC.
- Empat tema musim yang berganti setiap kenaikan level.
- Sistem kesulitan bertahap: dunia semakin cepat dan celah tiang semakin sempit.
- Tiang bergerak mulai skor 12, ditandai lampu kuning.
- Lima karakter bawaan dan dukungan gambar custom dari perangkat pemain.
- Efek bintang, konfeti, dan getaran layar.
- Efek suara yang dapat dimatikan.
- Rekor terbaik tersimpan di browser.
- Pause manual, fullscreen, dan pause otomatis ketika tab ditinggalkan.

## Menjalankan Proyek

### Persyaratan

- Node.js 20.19 atau lebih baru
- Node.js 22.12 atau lebih baru
- npm

Koneksi internet hanya diperlukan ketika memasang dependensi.

### Instalasi

```bash
cd kepak-kepak-pixel
npm install
npm run dev
```

Buka alamat yang ditampilkan di terminal. Secara umum alamatnya adalah `http://localhost:5173`.

### Perintah Pengembangan

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run typecheck` | Memeriksa tipe TypeScript dan Vue |
| `npm run build` | Membuat build produksi di folder `dist` |
| `npm run preview` | Menjalankan hasil build secara lokal |

## Kontrol

| Input | Aksi |
| --- | --- |
| Ketuk layar atau klik | Membuat karakter mengepak |
| `Space` atau `ArrowUp` | Membuat karakter mengepak |
| `Enter` di menu | Memulai permainan |
| `Enter` setelah game over | Memulai ulang permainan |
| `P` atau `Escape` | Jeda atau lanjutkan permainan |
| Tombol `FULL` | Masuk atau keluar dari fullscreen |
| Tombol `SUARA` | Mengaktifkan atau mematikan suara |

Ada dua perlindungan input agar kontrol terasa lebih stabil. Ketukan dalam 350 milidetik setelah tombol mulai ditekan diabaikan, dan setelah melanjutkan dari pause game mendapat masa aman selama 0,6 detik.

## Aturan Permainan

- Setiap melewati satu pasang tiang menambah skor sebanyak satu poin.
- Game berakhir ketika karakter menyentuh tiang atau tanah.
- Area tabrakan karakter menggunakan lingkaran radius 5 piksel, sedangkan sprite karakter berukuran 16 piksel.
- Layar game over muncul 0,9 detik setelah tabrakan.
- Penilaian akhir menggunakan bintang:

| Skor | Bintang |
| ---: | ---: |
| 0 | 0 |
| 1-4 | 1 |
| 5-14 | 2 |
| 15 atau lebih | 3 |

Semua ukuran dalam dokumentasi ini menggunakan piksel seni, yaitu satuan dunia internal Canvas, bukan piksel layar.

## Level dan Kesulitan

Level dihitung dengan rumus berikut:

```text
level = floor(score / 5) + 1
```

Kesulitan bertambah sampai skor 40:

```text
difficulty = min(score, 40) / 40
world speed = 42 + 38 * difficulty
pipe gap = 60 - 22 * difficulty
```

| Skor | Level | Tema |
| ---: | ---: | --- |
| 0-4 | 1 | Musim Semi |
| 5-9 | 2 | Musim Panas |
| 10-14 | 3 | Musim Gugur |
| 15-19 | 4 | Musim Dingin |
| 20+ | 5+ | Tema berulang dari Musim Semi |

Warna background berpindah secara halus selama sekitar 1,2 detik. Mulai skor 12, sebagian tiang juga dapat bergerak secara vertikal.

## Peta Kode Game

File [src/game.ts](src/game.ts) adalah pusat aturan permainan.

| Bagian | Tanggung jawab |
| --- | --- |
| `HEROES` dan `settings` | Daftar karakter dan pengaturan pemain |
| `THEMES` | Warna empat musim |
| `pixelate()` dan `build()` | Membuat sprite pixel art |
| `loadCustom()` | Memproses gambar custom pemain |
| `Engine.reset()` | Menyiapkan permainan baru |
| `Engine.flap()` | Mengatur input kepakan |
| `spawn()` | Membuat tiang baru dan menentukan tingkat kesulitannya |
| `point()` | Menambah skor dan memicu kenaikan level |
| `step()` | Menjalankan fisika, gerakan, partikel, dan tabrakan |
| `draw()` | Menggambar seluruh dunia permainan ke Canvas |

Alur utama game berjalan seperti ini:

```text
Input pemain
    |
    v
Engine.flap()
    |
    v
requestAnimationFrame()
    |
    +--> step(dt)
    |      gravitasi, posisi, pipa, skor, tabrakan
    |
    +--> draw()
           background, desa, pipa, hero, partikel
```

File [src/App.vue](src/App.vue) menghubungkan engine dengan antarmuka. File ini menangani menu, pilihan karakter, skor, banner level, pause, game over, keyboard, fullscreen, dan upload gambar.

## Mengubah Game

### Mengubah karakter

Daftar karakter berada di `HEROES` dalam [src/game.ts](src/game.ts). Karakter emoji diproses menjadi sprite 16x16 melalui `pixelate()`. Untuk membuat karakter pixel baru secara manual, tambahkan pola warna pada fungsi `build()` atau buat pola baris baru seperti `BODY` dan `W_DOWN`.

### Mengubah tema background

Warna background berada di `THEMES`. Properti yang tersedia meliputi:

- `skyTop` dan `skyBot` untuk gradasi langit.
- `sun` untuk matahari.
- `cloud` untuk awan.
- `hillFar` dan `hillNear` untuk bukit.
- `leaf` dan `leafDk` untuk pohon.
- `grass`, `grassLt`, `dirt`, dan `dirtDk` untuk tanah.
- `snow` untuk mengaktifkan salju pada objek tertentu.

### Mengubah keseimbangan permainan

Konstanta utama berada di bagian mesin game:

| Konstanta | Dampak |
| --- | --- |
| `GRAV` | Seberapa cepat karakter jatuh |
| `FLAP` | Kekuatan kepakan ke atas |
| `FALL` | Batas kecepatan jatuh |
| `GROUND` | Tinggi area tanah |
| `SPACING` | Jarak antar tiang |
| `PER_LEVEL` | Jumlah skor untuk naik level |

Ubah nilai-nilai tersebut sedikit demi sedikit, lalu jalankan `npm run typecheck` dan uji langsung di browser.

## Struktur Proyek

```text
kepak-kepak-pixel/
├── package.json
├── index.html
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.ts
    ├── style.css
    ├── App.vue
    ├── game.ts
    └── components/
        └── ToyButton.vue
```

| File | Fungsi |
| --- | --- |
| `index.html` | Titik masuk HTML dan konfigurasi viewport |
| `vite.config.ts` | Plugin Vue dan Tailwind |
| `tsconfig.json` | Konfigurasi TypeScript |
| `src/main.ts` | Memasang Vue, font, dan stylesheet |
| `src/style.css` | Tailwind, font, animasi, dan utilitas pixel |
| `src/App.vue` | Antarmuka dan penghubung ke game engine |
| `src/game.ts` | Logika game, rendering, sprite, tema, dan audio |
| `src/components/ToyButton.vue` | Komponen tombol bergaya pixel |

## Catatan Teknis

Canvas menggunakan ukuran dunia minimum 135 x 200 piksel seni. Saat layar berubah ukuran, Canvas diperbesar dengan skala bilangan bulat agar tepi pixel tetap tajam dan tidak blur.

Sprite, URL gambar, dan efek suara dibuat sesuai kebutuhan. Sprite yang sudah dibuat disimpan di cache agar tidak diproses ulang setiap frame.

Rekor terbaik disimpan menggunakan `localStorage` dengan kunci `fb_best`.