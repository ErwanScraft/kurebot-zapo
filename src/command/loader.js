import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commandDirectory = path.resolve(__dirname, "../../command");

async function getCommandFiles(directory) {
    const entries = await fs.readdir(directory, {
        withFileTypes: true
    });

    const files = [];

    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await getCommandFiles(entryPath));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".js")) {
            files.push(entryPath);
        }
    }

    return files;
}

export async function loadCommands() {
    const files = await getCommandFiles(commandDirectory);
    const commands = [];

    for (const file of files) {
        const module = await import(pathToFileURL(file).href);
        const command = module.default;

        if (!command) {
            continue;
        }

        commands.push({
            ...command,
            file
        });
    }

    return commands;
}