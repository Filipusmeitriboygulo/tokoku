require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

// view
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// pool koneksi
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "tokoku_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ---------- ROUTES ----------

// Landing / admin
app.get("/", (req, res) => {
  res.render("admin_landing");
});

// list produk (menggabungkan stok)
app.get("/produk", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT pr.id, pr.nama_produk, pr.harga, pr.deskripsi, IFNULL(sp.jumlah_stok,0) AS jumlah_stok
      FROM produk pr
      LEFT JOIN stok_produk sp ON pr.id = sp.id_produk
      ORDER BY pr.id
    `);
    res.render("produk", { produk: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  } finally {
    conn.release();
  }
});

// halaman pembelian (form + riwayat)
app.get("/pembelian", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [produk] = await conn.query(`
      SELECT pr.id, pr.nama_produk, pr.harga, IFNULL(sp.jumlah_stok,0) AS jumlah_stok
      FROM produk pr
      LEFT JOIN stok_produk sp ON pr.id = sp.id_produk
      ORDER BY pr.id
    `);
    const [pembelian] = await conn.query(`
      SELECT b.id, b.id_produk, b.jumlah, b.total_harga, b.status, b.tanggal_pembelian, p.nama_produk
      FROM pembelian b
      JOIN produk p ON b.id_produk = p.id
      ORDER BY b.tanggal_pembelian DESC
    `);
    res.render("pembelian", { produk, pembelian });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  } finally {
    conn.release();
  }
});

// Tambah pembelian (transaksi, SELECT FOR UPDATE)
app.post("/pembelian", async (req, res) => {
  const { id_produk, jumlah } = req.body;
  const qty = parseInt(jumlah, 10);
  if (!id_produk || !qty || qty <= 0)
    return res.status(400).send("Input tidak valid");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ambil harga & stok terkini, kunci baris stok
    const [rows] = await conn.query(
      `SELECT p.harga, IFNULL(sp.jumlah_stok,0) AS jumlah_stok
       FROM produk p
       LEFT JOIN stok_produk sp ON p.id = sp.id_produk
       WHERE p.id = ?
       FOR UPDATE`,
      [id_produk]
    );

    if (!rows.length) {
      await conn.rollback();
      return res.status(404).send("Produk tidak ditemukan");
    }

    const harga = Number(rows[0].harga);
    const stokSekarang = Number(rows[0].jumlah_stok);

    if (stokSekarang < qty) {
      await conn.rollback();
      return res.status(400).send("Stok tidak cukup");
    }

    const stokBaru = stokSekarang - qty;
    const total = harga * qty;

    // jika baris stok tidak ada (NULL) -> insert, else update
    const [rk] = await conn.query(
      "SELECT id FROM stok_produk WHERE id_produk = ? FOR UPDATE",
      [id_produk]
    );
    if (rk.length === 0) {
      await conn.query(
        "INSERT INTO stok_produk (id_produk, jumlah_stok) VALUES (?, ?)",
        [id_produk, stokBaru]
      );
    } else {
      await conn.query(
        "UPDATE stok_produk SET jumlah_stok = ? WHERE id_produk = ?",
        [stokBaru, id_produk]
      );
    }

    // insert pembelian
    await conn.query(
      "INSERT INTO pembelian (id_produk, jumlah, total_harga) VALUES (?, ?, ?)",
      [id_produk, qty, total]
    );

    await conn.commit();
    res.redirect("/pembelian");
  } catch (err) {
    console.error(err);
    try {
      await conn.rollback();
    } catch (e) {
      /* ignore */
    }
    res.status(500).send("Server error");
  } finally {
    conn.release();
  }
});

// Batalkan pembelian (transaksi: kembalikan stok & update status)
app.post("/pembelian/:id/cancel", async (req, res) => {
  const idPembelian = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ambil pembelian & stok (kunci)
    const [rows] = await conn.query(
      `
      SELECT b.id, b.id_produk, b.jumlah, b.status, IFNULL(sp.jumlah_stok,0) AS jumlah_stok
      FROM pembelian b
      LEFT JOIN stok_produk sp ON b.id_produk = sp.id_produk
      WHERE b.id = ?
      FOR UPDATE
    `,
      [idPembelian]
    );

    if (!rows.length) {
      await conn.rollback();
      return res.status(404).send("Pembelian tidak ditemukan");
    }

    const pb = rows[0];
    if (pb.status === "dibatalkan" || pb.status === "dibatalkan") {
      await conn.rollback();
      return res.redirect("/pembelian");
    }

    const stokBaru = Number(pb.jumlah_stok) + Number(pb.jumlah);

    // update stok_produk (insert jika belum ada)
    const [rks] = await conn.query(
      "SELECT id FROM stok_produk WHERE id_produk = ? FOR UPDATE",
      [pb.id_produk]
    );
    if (rks.length === 0) {
      await conn.query(
        "INSERT INTO stok_produk (id_produk, jumlah_stok) VALUES (?, ?)",
        [pb.id_produk, stokBaru]
      );
    } else {
      await conn.query(
        "UPDATE stok_produk SET jumlah_stok = ? WHERE id_produk = ?",
        [stokBaru, pb.id_produk]
      );
    }

    // update status pembelian
    await conn.query("UPDATE pembelian SET status = ? WHERE id = ?", [
      "dibatalkan",
      idPembelian,
    ]);

    await conn.commit();
    res.redirect("/pembelian");
  } catch (err) {
    console.error(err);
    try {
      await conn.rollback();
    } catch (e) {
      /* ignore */
    }
    res.status(500).send("Server error");
  } finally {
    conn.release();
  }
});

// jalanin server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
