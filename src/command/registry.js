const commands = new Map();
const aliases = new Map();

export function registerCommand(command) {
    if (!command?.command) {
        return {
            registered: false,
            reason: "invalid_command"
        };
    }

    const name = command.command.toLowerCase();

    if (commands.has(name) || aliases.has(name)) {
        return {
            registered: false,
            reason: "duplicate_command",
            command: name
        };
    }

    commands.set(name, command);

    for (const alias of command.aliases ?? []) {
        const normalizedAlias = alias.toLowerCase();

        if (
            commands.has(normalizedAlias) ||
            aliases.has(normalizedAlias)
        ) {
            commands.delete(name);

            return {
                registered: false,
                reason: "duplicate_alias",
                command: name,
                alias: normalizedAlias
            };
        }

        aliases.set(normalizedAlias, name);
    }

    return {
        registered: true,
        command: name
    };
}

export function getCommand(name) {
    if (!name) {
        return null;
    }

    const normalizedName = name.toLowerCase();

    if (commands.has(normalizedName)) {
        return commands.get(normalizedName);
    }

    const commandName = aliases.get(normalizedName);

    if (!commandName) {
        return null;
    }

    return commands.get(commandName) ?? null;
}

export function hasCommand(name) {
    return getCommand(name) !== null;
}

export function getCommands() {
    return [...commands.values()];
}

export function getCommandCount() {
    return commands.size;
}