/**
 * KureBot System Info.
 * Menampilkan informasi bot, runtime, dan sistem
 * saat proses startup dimulai.
 */

import os from "node:os";
import process from "node:process";

import botPkg from "../../../package.json" with { type: "json" };

const zapoVersion =
    botPkg.dependencies?.["zapo-js"] ??
    botPkg.devDependencies?.["zapo-js"] ??
    "Unknown";

const storeVersion =
    botPkg.dependencies?.["@zapo-js/store-mysql"] ??
    botPkg.devDependencies?.["@zapo-js/store-mysql"] ??
    "Unknown";

export default function systemInfo({
    session = "default",
    database = "MySQL",
    historySync = true,
    useQr = false
} = {}) {

    const cpus = os.cpus();
    const cores = os.availableParallelism();

    const cpu =
        cpus.length && cpus[0].model
            ? `${cpus[0].model} (${cores} Core)`
            : `${cores} Core`;

    const memory = process.memoryUsage();

    const rss = (memory.rss / 1024 / 1024).toFixed(1);
    const free = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
    const total = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);

    const rows = [
        ["Bot", `${botPkg.name} v${botPkg.version}`],
        ["Author", botPkg.author],
        ["WhatsApp API", `Zapo ${zapoVersion.replace(/^[~^]/, "")}`],
        ["Store", `MySQL Store ${storeVersion.replace(/^[~^]/, "")}`],
        ["Database", database],
        ["Session", session],
        ["", ""],
        ["History Sync", historySync ? "Enabled" : "Disabled"],
        ["QR Mode", useQr ? "Enabled" : "Disabled"],
        ["Pairing Mode", useQr ? "Disabled" : "Enabled"],
        ["", ""],
        ["Node.js", process.version],
        ["Platform", `${os.platform()} ${os.arch()}`],
        ["CPU", cpu],
        ["App Memory", `${rss} MB`],
        ["System RAM", `${free} / ${total} GB free`]
    ];

    console.log();
    console.log("─".repeat(54));

    for (const [key, value] of rows) {
        if (!key) {
            console.log();
            continue;
        }

        console.log(
            `  ${key.padEnd(14)} : ${value}`
        );
    }

    console.log();
    console.log("─".repeat(54));
}