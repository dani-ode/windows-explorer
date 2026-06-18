# 📂 Windows Explorer Clone (Monorepo)

### 1. Kloning Repositori (Git Clone)

Buka terminal kamu dan jalankan perintah berikut untuk mengunduh proyek:

```bash
git clone https://github.com/dani-ode/windows-explorer.git

```

masuk ke folder project

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

Pindah ke folder backend jika belum, lalu install dependensi menggunakan Bun:

```bash
cd apps/backend
bun install
```

Jalankan Migrasi Prisma untuk menyelaraskan skema tabel ke database `windows_explorer` yang baru dibuat, generate folder untuk prisma, dan masukkan data dummy di file seed.ts:

```bash
bun prisma migrate dev --name init
bunx prisma generate
bun run src/seed.ts
```

Jalankan server backend Elysia.js:

```bash
bun run dev
```

### 4. Jalankan Frontend

Dari direktory utama, pindah ke direktori frontend dari root proyek:

```bash
cd apps/frontend
```

Install seluruh dependensi frontend menggunakan Bun:

```bash
bun install
```

Jalankan server pencitraan lokal (development server) Vite:

```bash
bun run dev
```

Eureka!

Buka tautan lokal yang tertera di terminal kamu biasanya `http://localhost:5173` di peramban/browser kesayanganmu.

## Struktur Monorepo

```bash
windows-explorer/
│
├── apps/
│   ├── backend/          # REST API menggunakan Elysia.js & Database Prisma
│   └── frontend/         # Aplikasi Client-Side menggunakan Vue 3 & Pinia Store
│
├── packages/
│   ├── shared-types/     # Interface TypeScript yang digunakan bersama (e.g. ExplorerItem)
│   └── shared-utils/     # Fungsi helper/utilitas global bersama
│
├── package.json          # Workspace konfigurasi untuk Bun monorepo
├── bun.lockb             # Lockfile Bun
└── README.md             # Dokumentasi Proyek
```
