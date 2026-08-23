// @file src/command/index.js

import { loadCommands } from "./loader.js";
import {
    registerCommand,
    getCommands
} from "./registry.js";
import { executeRegisteredCommand } from "./executor.js";

let initialized = false;

export {
    executeRegisteredCommand
};

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

    return {
        commands: getCommands(),
        results
    };
}