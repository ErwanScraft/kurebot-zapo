# PROJECT GUILD

**Project:** KureBot-Zapo  
**Version:** 1.0.0  
**Development Branch:** `build`  
**Status:** Active Architectural Contract

---

## 1. Purpose

`PROJECT_GUILD.md` adalah blueprint teknis dan architectural contract untuk KureBot-Zapo.

Dokumen ini menjadi acuan utama bagi developer maupun AI ketika:

- membuat fitur baru;
- memperbaiki bug;
- melakukan refactor;
- menambah module atau utility;
- mengubah startup lifecycle;
- mengubah database layer;
- mengubah command system;
- mengubah WhatsApp integration;
- melakukan cleanup atau optimasi kode.

Tujuan utama:

> Menjaga struktur, naming, dependency direction, responsibility, dan pola implementasi KureBot-Zapo tetap konsisten.

---

# 2. Source of Truth

Branch `build` adalah source of truth untuk development aktif.

```text
build = development branch
main  = bukan baseline development aktif