// src/utils/system/loadConfig.js

import fs from "fs";
import path from "path";
import YAML from "yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.resolve(__dirname, "../../../config");

const CONFIG_FILE = path.join(CONFIG_DIR, "config.yml");
const EXAMPLE_FILE = path.join(CONFIG_DIR, "config.example.yml");

const loadYaml = (file) =>
    YAML.parse(fs.readFileSync(file, "utf8"));

const saveYaml = (file, data) =>
    fs.writeFileSync(file, YAML.stringify(data), "utf8");

const isObject = (value) =>
    value &&
    typeof value === "object" &&
    !Array.isArray(value);

function mergeConfig(source, target, changes = [], prefix = "") {
    for (const [key, value] of Object.entries(source)) {
        const current = prefix ? `${prefix}.${key}` : key;

        if (!(key in target)) {
            target[key] = value;
            changes.push(current);
            continue;
        }

        if (isObject(value) && isObject(target[key])) {
            mergeConfig(value, target[key], changes, current);
        }
    }

    return changes;
}

// Pastikan template tersedia
if (!fs.existsSync(EXAMPLE_FILE)) {
    throw new Error("config.example.yml tidak ditemukan.");
}

// Jika config.yml belum ada, buat dari template
if (!fs.existsSync(CONFIG_FILE)) {
    fs.copyFileSync(EXAMPLE_FILE, CONFIG_FILE);

    let text = "";

    text += "\n═══════════════════════════════════════════════════════\n";
    text += "✔ config.yml berhasil dibuat.\n\n";
    text += "Silakan edit file config/config.yml\n";
    text += "lalu jalankan kembali bot.\n";
    text += "═══════════════════════════════════════════════════════";

    console.log(text);

    process.exit(0);
}

const example = loadYaml(EXAMPLE_FILE);
const config = loadYaml(CONFIG_FILE);

// Auto merge
const changes = mergeConfig(example, config);

// Sinkronkan versi config
let versionUpdated = false;

if (config.config !== example.config) {
    config.config = example.config;
    versionUpdated = true;
}

if (changes.length || versionUpdated) {
    saveYaml(CONFIG_FILE, config);

    let text = "";

    text += "\n═══════════════════════════════════════════════════════\n";
    text += "🔄 Konfigurasi diperbarui otomatis.\n\n";

    if (changes.length) {
        text += "Field baru yang ditambahkan:\n";

        for (const field of changes) {
            text += `  + ${field}\n`;
        }

        text += "\n";
    } else {
        text += "Tidak ada field baru.\n\n";
    }

    if (versionUpdated) {
        text += `Versi config diperbarui ke: ${example.config}\n\n`;
    }

    text += "config.yml telah diperbarui.\n";
    text += "═══════════════════════════════════════════════════════";

    console.log(text);
}

const language = loadYaml(
    path.join(
        CONFIG_DIR,
        "language",
        `${config.language}.yml`
    )
);

Object.assign(globalThis, {
    database: config.database,
    mysql_store: config.mysql_store,
    mysql_data: config.mysql_data,
    email: config.email,
    owner: config.owner,
    users: config.users,
    bot: config.bot,
    price: config.price,
    sticker: config.sticker,
    lang: language
});

export const loadConfig = () => config;