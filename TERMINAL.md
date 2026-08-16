<div align="center">

# Terminal Guide

Command terminal yang digunakan selama proses pengembangan **KureBot**.

</div>

---

## Git

### Stage

Tambahkan seluruh perubahan ke staging area.

```bash
git add .
```

### Commit

Simpan perubahan ke repository lokal.

```bash
git commit -m "feat: tambah sistem logger"
```

#### Commit Prefix

| Prefix | Keterangan |
| ------- | ---------- |
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Perubahan struktur kode |
| `docs` | Dokumentasi |
| `style` | Formatting atau styling |
| `perf` | Optimasi performa |
| `chore` | Maintenance |

### Push

Kirim commit ke repository GitHub.

```bash
git push
```

> **Authentication**
>
> - **Username** → Username GitHub
> - **Password** → GitHub Personal Access Token (PAT)

---

## Prettier

### Format Project

```bash
prettier --write .
```

### Format Folder

```bash
prettier --write src
```

### Format File

```bash
prettier --write src/index.js
```

---

## Workflow

Urutan command yang direkomendasikan.

```bash
prettier --write .
git add .
git commit -m "feat: deskripsi perubahan"
git push
```

---

## Notes

- Jalankan `prettier --write .` sebelum melakukan commit.
- Gunakan pesan commit yang jelas dan konsisten.
- Lakukan commit secara berkala agar riwayat perubahan tetap rapi.
- Untuk autentikasi HTTPS, gunakan **GitHub Personal Access Token (PAT)**, bukan password akun.