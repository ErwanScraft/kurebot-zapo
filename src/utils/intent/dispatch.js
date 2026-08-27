/**
 * Intent Dispatcher.
 * Menghubungkan intent hasil natural-language detection
 * dengan command yang sudah terdaftar di command system.
 */

import { executeRegisteredCommand } from "#command";

const INTENT_COMMANDS = {
    "sticker.create": ".sticker"
};

export async function dispatchIntent(intent, context) {
    if (!intent) {
        return false;
    }

    const key = `${intent.domain}.${intent.action}`;
    const command = INTENT_COMMANDS[key];

    if (!command) {
        return false;
    }

    return executeRegisteredCommand(command, context);
}