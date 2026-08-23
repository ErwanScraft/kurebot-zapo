import { loadCommands } from "./loader.js";
import {
    registerCommand,
    getCommand,
    hasCommand,
    getCommands,
    getCommandCount
} from "./registry.js";
import { executeCommand } from "./executor.js";
import { resolveCommand } from "./resolver.js";

let initialized = false;

export async function loadCommandModules() {
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

export async function executeRegisteredCommand(name, context) {
    const resolved = resolveCommand(name);

    if (!resolved.found) {
        return false;
    }

    return executeCommand(resolved.command, context);
}

export {
    getCommand,
    hasCommand,
    getCommands,
    getCommandCount,
    resolveCommand
};