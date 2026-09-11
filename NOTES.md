# Catatan Proses Instalasi & Setup Environment
**Project:** Sistem Ticketing / Helpdesk Internal
**Fase:** Minggu 1 - Fondasi Database & Arsitektur Backend

## 1. Instalasi Tools Utama
- **Node.js:** Terinstal versi LTS. Verifikasi berhasil dijalankan menggunakan perintah `node -v` di terminal tanpa error.
- **Database:** MySQL Community Server telah diinstal beserta MySQL Workbench sebagai GUI untuk memudahkan manajemen database.
- **Version Control:** Git sudah terkonfigurasi (username dan email). Akses ke GitHub juga sudah diamankan menggunakan SSH Key.

## 2. Setup Repository & Git Workflow
- Membuat repository baru bernama `helpdesk-ticketing-app` di GitHub.
- Repository berhasil di-clone ke lokal. 
- Menerapkan konsep *feature branch* dengan membuat dan bekerja di branch `setup/environment` agar tidak mengganggu branch `main`.
- Mengonfigurasi file `.gitignore` dengan memasukkan `node_modules/` dan `.env` agar file berat dan kredensial sensitif tidak ikut ter-push ke GitHub.

## 3. Desain ERD & Skema Database
- **ERD:** Telah merancang skema relasi untuk 4 tabel utama yaitu `users`, `categories`, `tickets`, dan `ticket_comments`.
- **Normalisasi Dasar:** Tabel `categories` dipisah dari `tickets` agar pengelolaan data lebih efisien. Jika ada perubahan nama kategori, kita cukup mengubahnya di satu tempat tanpa perlu mengupdate seluruh baris tiket.
- **Eksekusi Schema:** File `database/schema.sql` berhasil dieksekusi dari keadaan kosong tanpa error. Verifikasi dilakukan menggunakan `SHOW TABLES;` dan `DESCRIBE tickets;`.
- **Pengujian Foreign Key (FK):** Relasi antar tabel berjalan sempurna. Uji coba *insert* data menggunakan referensi ID bodong (melanggar FK) telah sukses digagalkan oleh sistem MySQL. Tabel `ticket_comments` juga sudah menggunakan `ON DELETE CASCADE`.
- **Dummy Data:** Sebanyak 3-5 baris data percobaan (*dummy data*) telah berhasil dimasukkan ke setiap tabel untuk keperluan testing di minggu depan.

## 4. Finalisasi
- Semua tahapan telah disimpan (*commit*) dan diunggah (*push*) ke origin branch.
- *Pull Request* (PR) pertama sukses dibuat, melalui proses *self-review*, dan telah di-*merge* ke branch `main`.