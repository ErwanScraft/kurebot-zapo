<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://i.ibb.co.com/7xdmvrHj/logo-banner.webp" />
    <source media="(prefers-color-scheme: light)" srcset="https://i.ibb.co.com/7xdmvrHj/logo-banner.webp" />
    <img src="https://i.ibb.co.com/7xdmvrHj/logo-banner.webp" alt="zapo" width="400" />
  </picture>
</p>

<p align="center">
  <strong>Modern, Modular & Clean WhatsApp Bot</strong><br />
  KureBot adalah bot WhatsApp berbasis JavaScript (ES Modules) dengan arsitektur modular dan sistem plugin dinamis, sehingga mudah dikembangkan, dipelihara, dan disesuaikan dengan berbagai kebutuhan.
</p>

<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-v0.0.1-4CAF50" />
  <a href="https://www.npmjs.com/package/zapo-js">
    <img alt="zapo version" src="https://img.shields.io/npm/v/zapo-js?color=FF9800&label=Zapo" />
  </a>
  <img alt="npm tested" src="https://img.shields.io/badge/npm-tested%20on%2011.19.0-CB3837" />
  <img alt="node tested" src="https://img.shields.io/badge/node-tested%20on%20v26.4.0-339933" />
  <img alt="FFmpeg" src="https://img.shields.io/badge/FFmpeg-required-007808" />
  <img alt="architecture" src="https://img.shields.io/badge/architecture-modular-2563EB" />
  <img alt="plugins" src="https://img.shields.io/badge/plugins-dynamic-8B5CF6" />
  <img alt="code quality" src="https://img.shields.io/badge/code-clean-0A7EA4" />
  <img alt="license" src="https://img.shields.io/badge/license-Apache%202.0-blue" />
  </p>

***
## 📦 Instalasi

### Persyaratan

Pastikan perangkat Anda telah memenuhi persyaratan berikut sebelum menginstal KureBot.

| Komponen | Versi |
|----------|--------|
| Zapo | **v1.7.0** |
| Node.js | **v26.4.0** *(telah diuji)* |
| npm | **v11.19.0** *(telah diuji)* |
| FFmpeg | Versi terbaru |
| Git | Versi terbaru |

### 1. Clone Repository

```bash
git clone https://github.com/username/kurebot-zapo.git
cd kurebot-zapo
```

### 2. Instal Dependensi

```bash
npm install
```

### 3. Konfigurasi

Sesuaikan isi file `config.yml` sesuai kebutuhan Anda.

### 4. Menjalankan KureBot

**Mode Pairing Code (default)**

```bash
npm start
```

**Mode QR Code**

```bash
npm start -- --qr
```

> **Catatan:** Saat pertama kali dijalankan, KureBot akan meminta autentikasi akun WhatsApp. Secara default menggunakan **Pairing Code**. Untuk menggunakan **QR Code**, jalankan KureBot dengan parameter `--qr`.

---

## 📚 Dokumentasi

- **Project Guide** — [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)
- **Panduan Terminal** — [TERMINAL.md](./TERMINAL.md)
- **Changelog** — [CHANGELOG.md](./CHANGELOG.md)