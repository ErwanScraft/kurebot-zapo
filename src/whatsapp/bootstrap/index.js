import { logger } from "#utils/terminal";
import { loadConfig } from "#utils/system";

import banner from "./banner.js";
import systemInfo from "./system.js";
import initialize from "./initialize.js";


export default async function bootstrap() {
    const useQr = process.argv.includes("--qr");

    loadConfig();

    banner();

    systemInfo({
        session: "default",
        database: "MySQL",
        historySync: true,
        useQr
    });

    try {
        logger.info("Connecting to WhatsApp...");

        const { client } = await initialize({
            useQr
        });

        await client.connect();

    } catch (err) {
        logger.error("Terjadi kesalahan:");
        console.error(err);
    }
}