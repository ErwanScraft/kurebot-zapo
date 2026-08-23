import { logger } from "#utils/terminal";
import { initSend } from "#utils/serialize";
import { initializeDatabase } from "#database";
import { initializeCommands } from "#command";

import createAppStore from "./store.js";
import createClient from "./client.js";
import registerEvents from "./events.js";
import registerPairing from "./pairing.js";

export default async function initialize({ useQr }) {
    logger.init("Initialize Database");
    await initializeDatabase();
    
    logger.init("Initialize Commands");
    const commandSystem = await initializeCommands();

    logger.init("Initialize Store");
    const store = createAppStore();

    logger.init("Initialize Client");
    const client = createClient(store);

    logger.init("Initialize Events");
    registerEvents(client, { useQr });

    if (!useQr) {
        logger.init("Initialize Pairing");
        registerPairing(client);
    }

    logger.init("Initialize Sender");
    initSend(client);

    logger.success("Initialize Completed");

    return {
        store,
        client,
        commandSystem
    };
}