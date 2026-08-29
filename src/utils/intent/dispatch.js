/**
 * Intent Dispatcher.
 * Menghubungkan intent natural-language dengan command
 * atau response yang sesuai.
 */

import { executeRegisteredCommand } from "#command";

const INTENT_COMMANDS = {
    "sticker.create": ".sticker"
};

const INTENT_RESPONSES = {
    "sticker.help": [
        "Cara membuat sticker:",
        "1. Kirim gambar atau video ke chat.",
        "2. Mention @KureBot dengan pesan: jadikan sticker.",
        "3. Bot akan mengubah media tersebut menjadi sticker."
    ].join("\n")
};

export async function dispatchIntent(intent, context) {
    if (!intent) {
        return false;
    }

    const key = `${intent.domain}.${intent.action}`;

    const command = INTENT_COMMANDS[key];

    if (command) {
        return executeRegisteredCommand(command, context);
    }

    const response = INTENT_RESPONSES[key];

    if (response) {
        await context.send.text(context.m.chat, response);
        return true;
    }

    return false;
}