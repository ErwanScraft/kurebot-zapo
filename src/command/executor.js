// @file src/command/executor.js

import { resolveCommand } from "./resolver.js";
import { logger } from "#utils/terminal";

export async function executeRegisteredCommand(name, context) {
    const resolved = resolveCommand(name);

    if (!resolved.found) {
        return false;
    }

    try {
        await resolved.command.run(context);

        return true;
    } catch (error) {
        logger.error(
            `Command ${name} failed: ${error.message}`
        );

        return false;
    }
}