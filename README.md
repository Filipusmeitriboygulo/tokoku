# 🛒 Tokoku

Sistem sederhana untuk **admin toko** yang dapat:
- Menambahkan data pembelian produk.
- Membatalkan pembelian (status: dibatalkan).
- Menyimpan data produk, stok, dan transaksi ke database.
- Mengelola stok produk agar selalu terupdate saat pembelian dilakukan.

---

## ⚙️ Database Structure

### 🧩 1️⃣ Tabel `produk`
Menyimpan data utama setiap produk yang dijual.

| Kolom | Tipe | Keterangan |
|--------|------|------------|
| id | INT (PK, AUTO_INCREMENT) | ID unik produk |
| nama_produk | VARCHAR(150) | Nama produk |
| harga | DECIMAL(12,2) | Harga produk per satuan |
| deskripsi | TEXT | Deskripsi singkat produk |

---

### 🧩 2️⃣ Tabel `stok_produk`
Menyimpan jumlah stok dari masing-masing produk.  
Setiap produk memiliki satu baris stok.

| Kolom | Tipe | Keterangan |
|--------|------|------------|
| id | INT (PK, AUTO_INCREMENT) | ID stok |
| id_produk | INT (FK) | Relasi ke tabel `produk` |
| jumlah_stok | INT | Jumlah stok produk saat ini |

> **Relasi:**  
> `stok_produk.id_produk` → `produk.id`  
> dengan `ON DELETE CASCADE` (jika produk dihapus, stok ikut terhapus).

---

### 🧩 3️⃣ Tabel `pembelian`
Mencatat setiap transaksi pembelian yang dilakukan oleh admin toko.

| Kolom | Tipe | Keterangan |
|--------|------|------------|
| id | INT (PK, AUTO_INCREMENT) | ID transaksi |
| id_produk | INT (FK) | Produk yang dibeli |
| jumlah | INT | Jumlah produk yang dibeli |
| total_harga | DECIMAL(12,2) | Total harga pembelian |
| status | ENUM('selesai','dibatalkan') | Status transaksi |
| tanggal_pembelian | TIMESTAMP | Waktu pembelian |

> **Relasi:**  
> `pembelian.id_produk` → `produk.id`  
> dengan `ON DELETE CASCADE`.

---

## 💾 Contoh Data Awal

### 🛍️ Produk dan Stok Awal
| Nama Produk | Harga | Jumlah Stok |
|--------------|--------|--------------|
| Sabun Mandi | 5000 | 50 |
| Shampoo Herbal | 10000 | 30 |
| Odol Mint | 7000 | 40 |
| Susu Segar | 15000 | 20 |
| Roti Tawar | 8000 | 25 |
| Kopi Hitam | 12000 | 35 |
| Gula Pasir | 14000 | 45 |
| Teh Celup | 9000 | 50 |
| Mie Instan | 4000 | 100 |
| Minyak Goreng | 18000 | 15 |

---

## 🚀 Cara Menjalankan

1. **Import database**
   - Jalankan SQL berikut (atau file `tokoku_db.sql`):
     ```sql
     CREATE DATABASE tokoku_db;
     USE tokoku_db;
     ```
   - Jalankan seluruh skrip tabel (`produk`, `stok_produk`, `pembelian`).
   - Masukkan data awal produk dan stok.

2. **Jalankan server Node.js**
   ```bash
   npm install
   node app.js

atau jika menggunakan nodemon:

npm run dev
3. Buka aplikasi

Akses di browser:
👉 http://localhost:3000

