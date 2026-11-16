# Dokumentasi Pengujian API Helpdesk - Minggu 3 & 4

## Header Wajib
Gunakan Header `Authorization: Bearer <token_jwt>` pada setiap request terproteksi.

## 1. Modul Categories
- **GET /api/categories**: Mengambil semua kategori (Role: All)
- **POST /api/categories**: Menambah kategori (Role: Admin Only, Employee -> 403)
- **PUT /api/categories/:id**: Mengubah kategori (Role: Admin Only)
- **DELETE /api/categories/:id**: Menghapus kategori (Role: Admin Only)

## 2. Modul Tickets
- **GET /api/tickets**: List tiket dengan pagination & search.
  - Query Param: `?page=1&limit=5&status=open&q=wifi`
  - Employee: Hanya melihat tiket miliknya sendiri.
  - Admin: Melihat semua tiket seluruh pengguna.
- **GET /api/tickets/:id**: Detail tiket.
  - Ownership Check: Employee yang mencoba membuka tiket pengguna lain mengembalikan status `403 Forbidden`.
- **POST /api/tickets**: Membuat tiket baru.
  - Mengirimkan event `ticket:created` via WebSocket ke room `admins`.
- **PUT /api/tickets/:id/status**: Mengubah status tiket.
  - Body: `{ "status": "in_progress" }`
  - Mengirimkan event `ticket:updated` via WebSocket.

## 3. Modul Comments
- **GET /api/tickets/:id/comments**: Ambil semua komentar di tiket tersebut.
- **POST /api/tickets/:id/comments**: Tambahkan komentar baru.
  - Mengirimkan event `comment:created` via WebSocket.