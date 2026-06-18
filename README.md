# 📂 Windows Explorer Clone (Monorepo)

### 1. Kloning Repositori (Git Clone)

Buka terminal kamu dan jalankan perintah berikut untuk mengunduh proyek:

```bash
git clone https://github.com/dani-ode/windows-explorer.git

```

```bash
cd windows_explorer
```

### 2. Konfigurasi Database PostgreSQL

Buka aplikasi manajemen database kamu (seperti pgAdmin, DBeaver, atau via CLI).

Buat database baru dengan nama:

```bash
windows_explorer
```

Buat file bernama `.env` di dalam folder apps/backend/ tersebut dan isi dengan string koneksi database kamu. Contoh:

```bash
DATABASE_URL="postgresql://username_postgres:password_kamu@localhost:5432/windows_explorer?schema=public"
```

### 3. Jalankan Backend

```bash
cd apps/backend
```
