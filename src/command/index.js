// @file src/command/index.js

import { loadCommands } from "./loader.js";
import {
    registerCommand,
    getCommands
} from "./registry.js";
import { executeRegisteredCommand } from "./executor.js";
import { logger } from "#utils/terminal";

let initialized = false;

export async function initializeCommands() {
    if (initialized) {
        return {
            commands: getCommands(),
            results: []
        };
    }

    const commands = await loadCommands();
    const results = [];

    for (const command of commands) {
        results.push(registerCommand(command));
    }

    initialized = true;

    const registeredCommands = getCommands();

    logger.success(
        `${registeredCommands.length} commands initialized`
    );

    return {
        commands: registeredCommands,
        results
    };
}

export {
    executeRegisteredCommand
};

export { parseOptions } from "./options.js"