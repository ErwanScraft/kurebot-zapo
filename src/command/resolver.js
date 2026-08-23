import { getCommand } from "./registry.js";

export function resolveCommand(name, prefix = ".") {
    if (!name || !name.startsWith(prefix)) {
        return {
            found: false,
            command: null
        };
    }

    const commandName = name.slice(prefix.length).trim();

    if (!commandName) {
        return {
            found: false,
            command: null
        };
    }

    const command = getCommand(commandName);

    if (!command) {
        return {
            found: false,
            command: null
        };
    }

    return {
        found: true,
        command
    };
}