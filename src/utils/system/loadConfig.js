// src/utils/system/loadConfig.js

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.resolve(__dirname, '../../../config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.yml');
const EXAMPLE_FILE = path.join(CONFIG_DIR, 'config.example.yml');

function loadYaml(file) {
    return YAML.parse(fs.readFileSync(file, 'utf8'));
}

function saveYaml(file, data) {
    fs.writeFileSync(file, YAML.stringify(data), 'utf8');
}

function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function mergeConfig(source, target, changes = [], prefix = '') {
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

function ensureConfig() {
    if (!fs.existsSync(EXAMPLE_FILE)) {
        throw new Error('config.example.yml tidak ditemukan.');
    }

    if (!fs.existsSync(CONFIG_FILE)) {
        fs.copyFileSync(EXAMPLE_FILE, CONFIG_FILE);

        console.log(
            '\n═══════════════════════════════════════════════════════\n' +
            '✔ config.yml berhasil dibuat.\n\n' +
            'Silakan edit file config/config.yml\n' +
            'lalu jalankan kembali bot.\n' +
            '═══════════════════════════════════════════════════════'
        );

        return false;
    }

    return true;
}

export async function loadConfig() {
    if (!ensureConfig()) {
        process.exit(0);
    }

    const example = loadYaml(EXAMPLE_FILE);
    const config = loadYaml(CONFIG_FILE);

    const changes = mergeConfig(example, config);

    let versionUpdated = false;

    if (config.config !== example.config) {
        config.config = example.config;
        versionUpdated = true;
    }

    if (changes.length || versionUpdated) {
        saveYaml(CONFIG_FILE, config);

        let text =
            '\n═══════════════════════════════════════════════════════\n' +
            '🔄 Konfigurasi diperbarui otomatis.\n\n';

        if (changes.length) {
            text += 'Field baru yang ditambahkan:\n';

            for (const field of changes) {
                text += `  + ${field}\n`;
            }

            text += '\n';
        } else {
            text += 'Tidak ada field baru.\n\n';
        }

        if (versionUpdated) {
            text += `Versi config diperbarui ke: ${example.config}\n\n`;
        }

        text +=
            'config.yml telah diperbarui.\n' +
            '═══════════════════════════════════════════════════════';

        console.log(text);
    }

    const languageFile = path.join(
        CONFIG_DIR,
        'language',
        `${config.language}.yml`
    );

    if (!fs.existsSync(languageFile)) {
        throw new Error(
            `File bahasa tidak ditemukan: ${languageFile}`
        );
    }

    const language = loadYaml(languageFile);

    Object.assign(globalThis, {
        config,
    
        database: config.database,
        mysql_store: config.mysql_store,
        mysql_data: config.mysql_data,
        season: config.season,
        email: config.email,
        owner: config.owner,
        users: config.users,
        bot: config.bot,
        price: config.price,
        sticker: config.sticker,
        webhook: config.webhook,
        lang: language
    });

    return config;
}