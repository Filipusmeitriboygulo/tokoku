-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 30, 2025 at 12:44 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tokoku_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `pembelian`
--

CREATE TABLE `pembelian` (
  `id` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `total_harga` decimal(12,2) NOT NULL,
  `status` enum('selesai','dibatalkan') DEFAULT 'selesai',
  `tanggal_pembelian` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pembelian`
--

INSERT INTO `pembelian` (`id`, `id_produk`, `jumlah`, `total_harga`, `status`, `tanggal_pembelian`) VALUES
(1, 3, 2, '14000.00', 'selesai', '2025-10-29 16:26:09'),
(2, 5, 24, '192000.00', 'selesai', '2025-10-29 16:26:35');

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id` int(11) NOT NULL,
  `nama_produk` varchar(150) NOT NULL,
  `harga` decimal(12,2) NOT NULL,
  `deskripsi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produk`
--

INSERT INTO `produk` (`id`, `nama_produk`, `harga`, `deskripsi`) VALUES
(1, 'Sabun Mandi Lifebuoy', '5000.00', 'Sabun mandi antiseptik 90 gram'),
(2, 'Shampoo Sunsilk', '10000.00', 'Shampoo lembut untuk rambut hitam berkilau'),
(3, 'Odol Pepsodent', '7000.00', 'Pasta gigi perlindungan menyeluruh 75 gram'),
(4, 'Susu Indomilk', '15000.00', 'Susu cair rasa coklat 1 liter'),
(5, 'Roti Sari Roti', '8000.00', 'Roti tawar lembut isi 10 potong'),
(6, 'Kopi Kapal Api', '12000.00', 'Kopi bubuk sachet isi 20'),
(7, 'Gula Pasir Gulaku', '14000.00', 'Gula pasir kemasan 1 kg'),
(8, 'Teh Sosro', '9000.00', 'Teh celup isi 25 kantong'),
(9, 'Mie Instan Indomie', '4000.00', 'Mie goreng spesial 85 gram'),
(10, 'Minyak Goreng Bimoli', '18000.00', 'Minyak goreng kemasan 1 liter');

-- --------------------------------------------------------

--
-- Table structure for table `stok_produk`
--

CREATE TABLE `stok_produk` (
  `id` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `jumlah_stok` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stok_produk`
--

INSERT INTO `stok_produk` (`id`, `id_produk`, `jumlah_stok`) VALUES
(1, 1, 10),
(2, 2, 15),
(3, 3, 18),
(4, 4, 12),
(5, 5, 1),
(6, 6, 18),
(7, 7, 8),
(8, 8, 14),
(9, 9, 9),
(10, 10, 30);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pembelian`
--
ALTER TABLE `pembelian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_produk` (`id_produk`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stok_produk`
--
ALTER TABLE `stok_produk`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_produk` (`id_produk`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pembelian`
--
ALTER TABLE `pembelian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `stok_produk`
--
ALTER TABLE `stok_produk`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pembelian`
--
ALTER TABLE `pembelian`
  ADD CONSTRAINT `pembelian_ibfk_1` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stok_produk`
--
ALTER TABLE `stok_produk`
  ADD CONSTRAINT `stok_produk_ibfk_1` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
