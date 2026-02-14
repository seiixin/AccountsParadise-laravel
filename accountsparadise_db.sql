-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 11, 2026 at 07:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `accountsparadise_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `status`, `created_by_id`, `approved_by_id`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 'Weapons', 'approved', NULL, NULL, NULL, '2026-02-01 02:05:51', NULL),
(2, 'Armor', 'approved', NULL, NULL, NULL, '2026-02-01 02:05:51', NULL),
(3, 'Game Accounts', 'approved', NULL, NULL, NULL, '2026-02-01 02:05:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listings`
--

CREATE TABLE `listings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `merchant_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listings`
--

INSERT INTO `listings` (`id`, `merchant_id`, `title`, `description`, `price`, `currency`, `category_id`, `created_at`, `updated_at`) VALUES
(2, 4, 'Legendary Armor Set', 'High defense armor bundle', 3200.00, '', 2, '2026-02-01 01:58:23', NULL),
(3, 4, 'Epic Sword of Valor', 'Rare in-game sword item', 1500.00, '', 1, '2026-02-01 01:59:52', NULL),
(4, 4, 'Legendary Armor Set', 'High defense armor bundle', 3200.00, '', 2, '2026-02-01 01:59:52', NULL),
(5, 4, 'Epic Sword of Valor', 'Rare in-game sword item', 1500.00, '', 1, '2026-02-01 02:00:25', NULL),
(6, 4, 'Legendary Armor Set', 'High defense armor bundle', 3200.00, '', 3, '2026-02-01 02:00:25', NULL),
(7, 4, 'Awesome Game', 'An amazing game!', 100.00, 'USD', 1, '2026-01-31 23:13:37', '2026-01-31 23:13:37');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_02_01_000001_add_username_role_to_users_table', 1),
(5, '2026_02_01_000002_create_orders_table', 1),
(6, '2026_02_01_000003_create_listings_table', 1),
(7, '2026_02_01_000004_create_order_disputes_table', 1),
(8, '2026_02_01_000005_create_payout_requests_table', 1),
(9, '2026_02_01_000006_create_order_deliveries_table', 1),
(10, '2026_02_01_000007_create_order_payment_proofs_table', 1),
(11, '2026_02_01_023447_add_status_and_audit_columns_to_categories_table', 2),
(12, '2026_02_01_032616_add_dispute_columns_to_orders_table', 3),
(13, '2026_02_01_071321_add_currency_to_listings_table', 4),
(14, '2026_02_01_071856_change_delivery_payload_to_text', 5),
(15, '2026_02_01_090757_add_deleted_at_to_orders_table', 6),
(16, '2026_02_01_091936_add_deleted_at_to_users_table', 7);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_no` varchar(255) NOT NULL,
  `buyer_id` bigint(20) UNSIGNED NOT NULL,
  `seller_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `listing_title_snapshot` varchar(255) DEFAULT NULL,
  `game_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`game_snapshot`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `dispute_reason` varchar(255) DEFAULT NULL,
  `dispute_description` text DEFAULT NULL,
  `dispute_evidence` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_no`, `buyer_id`, `seller_id`, `status`, `amount`, `currency`, `listing_title_snapshot`, `game_snapshot`, `created_at`, `updated_at`, `dispute_reason`, `dispute_description`, `dispute_evidence`, `deleted_at`) VALUES
(1, 'ORD-2026-0001', 7, 4, 'refunded', 1500.00, 'PHP', 'Epic Sword of Valor', '{\"game_name\": \"Valor Quest\", \"platform\": \"PC\"}', '2026-02-01 01:59:52', '2026-02-01 01:08:32', 'Damaged item', 'The product was damaged', 'evidence_url', '2026-02-01 01:08:32'),
(2, 'ORD-2026-0002', 2, 4, 'refunded', 3200.00, 'PHP', 'Legendary Armor Set', '{\"game_name\": \"Valor Quest\", \"platform\": \"PC\"}', '2026-02-01 01:59:52', '2026-02-01 01:42:07', NULL, NULL, NULL, '2026-02-01 01:42:07');

-- --------------------------------------------------------

--
-- Table structure for table `order_deliveries`
--

CREATE TABLE `order_deliveries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `stage` varchar(255) NOT NULL,
  `delivery_payload` longtext NOT NULL,
  `delivered_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `delivered_to_id` bigint(20) UNSIGNED DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `received_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_deliveries`
--

INSERT INTO `order_deliveries` (`id`, `order_id`, `stage`, `delivery_payload`, `delivered_by_id`, `delivered_to_id`, `delivered_at`, `received_at`, `received_by_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'delivered_to_buyer', '{\"item_code\":\"SV-001\",\"notes\":\"Deliver safely\"}', 4, 7, '2026-02-01 00:45:28', '2026-02-01 00:05:16', 3, NULL, '2026-02-01 00:45:28'),
(2, 1, 'received_by_midman', 'delivery details', 4, 2, '2026-01-31 23:19:20', NULL, NULL, '2026-01-31 23:19:20', '2026-01-31 23:19:20');

-- --------------------------------------------------------

--
-- Table structure for table `order_disputes`
--

CREATE TABLE `order_disputes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `decision_notes` text DEFAULT NULL,
  `decided_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `decided_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_disputes`
--

INSERT INTO `order_disputes` (`id`, `order_id`, `status`, `reason`, `description`, `resolution`, `decision_notes`, `decided_by_id`, `decided_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'resolved', 'Item mismatch', 'Delivered item does not match listing', 'refund', 'Resolved', 1, '2026-02-01 01:14:40', '2026-02-01 02:01:56', '2026-02-01 01:14:40'),
(2, 1, 'open', 'Damaged product', 'The product arrived damaged', NULL, NULL, NULL, NULL, '2026-01-31 19:36:24', '2026-01-31 19:36:24'),
(3, 2, 'resolved', NULL, NULL, 'refund_buyer', 'Resolved after review', 1, '2026-02-01 01:41:51', '2026-02-01 01:41:51', '2026-02-01 01:41:51');

-- --------------------------------------------------------

--
-- Table structure for table `order_payment_proofs`
--

CREATE TABLE `order_payment_proofs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `payment_reference` varchar(255) NOT NULL,
  `id_image_path` varchar(255) DEFAULT NULL,
  `receipt_image_path` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `reviewed_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_payment_proofs`
--

INSERT INTO `order_payment_proofs` (`id`, `order_id`, `payment_reference`, `id_image_path`, `receipt_image_path`, `status`, `reviewed_by_id`, `reviewed_at`, `review_notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'GCASH-REF-001', 'uploads/ids/buyer_id_2.jpg', 'uploads/receipts/receipt_1.jpg', 'approved', 1, '2026-02-01 04:00:00', 'Payment proof verified', '2026-02-01 01:59:53', '2026-01-31 19:35:44'),
(2, 1, 'ref12345', 'image_url', 'receipt_url', 'pending', NULL, NULL, NULL, '2026-01-31 19:35:02', '2026-01-31 19:35:02');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payout_requests`
--

CREATE TABLE `payout_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `seller_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `status` varchar(255) NOT NULL,
  `approved_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approval_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payout_requests`
--

INSERT INTO `payout_requests` (`id`, `seller_id`, `amount`, `currency`, `status`, `approved_by_id`, `approved_at`, `approval_notes`, `created_at`, `updated_at`) VALUES
(1, 4, 1500.00, 'PHP', 'approved', 1, '2026-02-01 01:12:21', 'Approved after review', '2026-02-01 02:02:02', '2026-02-01 01:12:21'),
(2, 4, 100.00, 'USD', 'pending', NULL, NULL, NULL, '2026-01-31 23:20:33', '2026-01-31 23:20:33');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('9BHq1cROiunk1lN5l2fwuGsDQwm5Iaqd4fVdUWAC', 1, '127.0.0.1', 'PostmanRuntime/7.51.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR1IwdGxKbVJUZmFPbWhEUTUwU2NDM1c1SVo3N2RyMUFyZkl2WXhNbCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1770833086),
('DPfFJ3STmroT8mkRwfPnCFFAGpUclJlp0fgx5lCk', 1, '127.0.0.1', 'PostmanRuntime/7.51.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidVVBbjJLUk9QMVR3VnVoYVVyTUp0bE9TTVZteFU2b0V0ZzhucmR6OCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1769938927),
('mNzDyjXWWc8HeNju0mOolsWHuhUwcQrUssu6Rz6v', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR01TNFRYdXU0N1lLTE01Mmprd1czc1lvelBVeFpaR203dkZwTFY2RCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fX0=', 1769936783);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'buyer',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Updated User', 'updateduser', 'updated@example.com', 'admin', '2026-02-01 01:18:08', '$2y$12$20Q026qqgYXtbLT3Fqq0u.oLONwPxTDpA5jJtc5.lNuFpwni33dDm', NULL, '2026-01-31 17:17:18', '2026-02-01 01:16:44', NULL),
(2, 'John Buyer', 'johnbuyer', 'johnbuyer@example.com', 'buyer', NULL, '$2y$12$Zc3aqVHaiFJlzh44wAkUb.8dwiV0L0b7.78EvJjlZSHl9rLwuzlm2', NULL, '2026-01-31 17:28:49', '2026-01-31 17:28:49', NULL),
(3, 'Alex Middleman', 'alexmiddleman', 'alexmiddleman@example.com', 'midman', NULL, '$2y$12$pQ/kfd6ML7SoNHdorTk8C.JY.coeC7lNwWvMoDXNSrnFXyvVQ9Czm', NULL, '2026-01-31 17:28:49', '2026-02-01 01:20:41', '2026-02-01 01:20:41'),
(4, 'Maria Merchant', 'mariamerchant', 'mariamerchant@example.com', 'merchant', NULL, '$2y$12$9.ldyFivz.d3HKLVVf9ah.IxZ.3XljBuSJ7kaM7Oz8xpbpMcRBhC6', NULL, '2026-01-31 17:28:49', '2026-01-31 17:28:49', NULL),
(7, 'John Buyer', 'johnbuyer1769909393', 'johnbuyer1769909393@example.com', 'buyer', '2026-01-31 17:29:53', '$2y$12$Vm6deDwpcGtasJP3Azut8OnM01lusNE1R45ali1rHpPeeGbnTmwQ6', 'YghStGe9t5', '2026-01-31 17:29:54', '2026-01-31 17:29:54', NULL),
(8, 'Alex Middleman', 'alexmiddleman1769909394', 'alexmiddleman1769909394@example.com', 'midman', '2026-01-31 17:29:54', '$2y$12$H5KTh4vSQ097ylh3qZZybePrqHXYCfofoLSjvgL5otKfzy9hz2mJe', 'rXfUtC5kcb', '2026-01-31 17:29:54', '2026-01-31 17:29:54', NULL),
(9, 'Maria Merchant', 'mariamerchant1769909394', 'mariamerchant1769909394@example.com', 'merchant', '2026-01-31 17:29:54', '$2y$12$0IgVNwVWALXVcXqZiC8YMeIsv4rMwef8atgT7VCMbjRaQgTRrzvWC', 'HHIXHaAuns', '2026-01-31 17:29:54', '2026-01-31 17:29:54', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `listings`
--
ALTER TABLE `listings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listings_merchant_id_foreign` (`merchant_id`),
  ADD KEY `listings_category_id_foreign` (`category_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_no_unique` (`order_no`),
  ADD KEY `orders_buyer_id_foreign` (`buyer_id`),
  ADD KEY `orders_seller_id_foreign` (`seller_id`);

--
-- Indexes for table `order_deliveries`
--
ALTER TABLE `order_deliveries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_deliveries_order_id_foreign` (`order_id`),
  ADD KEY `order_deliveries_delivered_by_id_foreign` (`delivered_by_id`),
  ADD KEY `order_deliveries_delivered_to_id_foreign` (`delivered_to_id`),
  ADD KEY `order_deliveries_received_by_id_foreign` (`received_by_id`);

--
-- Indexes for table `order_disputes`
--
ALTER TABLE `order_disputes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_disputes_order_id_foreign` (`order_id`),
  ADD KEY `order_disputes_decided_by_id_foreign` (`decided_by_id`);

--
-- Indexes for table `order_payment_proofs`
--
ALTER TABLE `order_payment_proofs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_payment_proofs_order_id_foreign` (`order_id`),
  ADD KEY `order_payment_proofs_reviewed_by_id_foreign` (`reviewed_by_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payout_requests`
--
ALTER TABLE `payout_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payout_requests_seller_id_foreign` (`seller_id`),
  ADD KEY `payout_requests_approved_by_id_foreign` (`approved_by_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listings`
--
ALTER TABLE `listings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_deliveries`
--
ALTER TABLE `order_deliveries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_disputes`
--
ALTER TABLE `order_disputes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_payment_proofs`
--
ALTER TABLE `order_payment_proofs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payout_requests`
--
ALTER TABLE `payout_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `listings`
--
ALTER TABLE `listings`
  ADD CONSTRAINT `listings_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `listings_merchant_id_foreign` FOREIGN KEY (`merchant_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_buyer_id_foreign` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_deliveries`
--
ALTER TABLE `order_deliveries`
  ADD CONSTRAINT `order_deliveries_delivered_by_id_foreign` FOREIGN KEY (`delivered_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `order_deliveries_delivered_to_id_foreign` FOREIGN KEY (`delivered_to_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `order_deliveries_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_deliveries_received_by_id_foreign` FOREIGN KEY (`received_by_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_disputes`
--
ALTER TABLE `order_disputes`
  ADD CONSTRAINT `order_disputes_decided_by_id_foreign` FOREIGN KEY (`decided_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `order_disputes_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `order_payment_proofs`
--
ALTER TABLE `order_payment_proofs`
  ADD CONSTRAINT `order_payment_proofs_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_payment_proofs_reviewed_by_id_foreign` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `payout_requests`
--
ALTER TABLE `payout_requests`
  ADD CONSTRAINT `payout_requests_approved_by_id_foreign` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `payout_requests_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
