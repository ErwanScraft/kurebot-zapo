import { initSend } from "#utils/serialize";
import { loadCommandModules } from "../../command/index.js";

import createAppStore from "./store.js";
import createClient from "./client.js";
import registerEvents from "./events.js";
import registerPairing from "./pairing.js";

export default async function initialize({ useQr }) {
    const store = createAppStore();

    const client = createClient(store);

    registerEvents(client, { useQr });

    if (!useQr) {
        registerPairing(client);
    }

    initSend(client);

    const commandSystem = await loadCommandModules();

    return {
        store,
        client,
        commandSystem
    };
}