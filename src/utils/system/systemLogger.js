// src/utils/system/systemLogger.js

import fs from "fs/promises";
import path from "path";

const LOG_DIR = {
    error: "errors",
    warn: "warnings",
    info: "info"
};

const LOG_COLOR = {
    error: "\x1b[31m",
    warn: "\x1b[33m",
    info: "\x1b[36m"
};

const LOG_CONSOLE = {
    error: console.error,
    warn: console.warn,
    info: console.info
};

export class SystemLogger {
    constructor({
        logDir = path.join(process.cwd(), "logs"),
        maxFileSize = 10 * 1024 * 1024,
        retentionDays = 30,
        enableConsole = true
    } = {}) {
        this.logDir = logDir;
        this.maxFileSize = maxFileSize;
        this.retentionDays = retentionDays;
        this.enableConsole = enableConsole;

        this.init();
    }

    async init() {
        await this.initialize();
        await this.cleanOldLogs();
    }

    async initialize() {
        await fs.mkdir(this.logDir, { recursive: true });

        await Promise.all(
            [
                "errors",
                "warnings",
                "info",
                "archive"
            ].map(dir =>
                fs.mkdir(path.join(this.logDir, dir), {
                    recursive: true
                })
            )
        );
    }

    formatDate(date = new Date()) {
        return date.toISOString().slice(0, 10);
    }

    getLogFilePath(level = "error") {
        return path.join(
            this.logDir,
            LOG_DIR[level],
            `${this.formatDate()}.log`
        );
    }

    async ensureLogFile(level) {
        const file = this.getLogFilePath(level);

        try {
            const stat = await fs.stat(file);

            if (stat.size >= this.maxFileSize) {
                await fs.rename(
                    file,
                    file.replace(".log", `-${Date.now()}.log`)
                );
            }
        } catch {}

        return file;
    }

    async cleanOldLogs() {
        const expired = Date.now() - this.retentionDays * 86400000;
        const archive = path.join(this.logDir, "archive");

        await fs.mkdir(archive, { recursive: true });

        for (const dir of Object.values(LOG_DIR)) {
            const folder = path.join(this.logDir, dir);

            let files = [];

            try {
                files = await fs.readdir(folder);
            } catch {
                continue;
            }

            for (const file of files) {
                const filePath = path.join(folder, file);
                const stat = await fs.stat(filePath);

                if (
                    stat.isFile() &&
                    stat.mtimeMs < expired
                ) {
                    await fs.rename(
                        filePath,
                        path.join(
                            archive,
                            `${Date.now()}-${file}`
                        )
                    );
                }
            }
        }
    }
    
    formatLog({ timestamp, level, location, error, context }) {
        const err = error instanceof Error
            ? error
            : new Error(String(error));

        const output = [
            `[${timestamp.toISOString()}] ${level.toUpperCase()}`,
            "",
            `Location : ${location}`,
            `Message  : ${err.message}`
        ];

        if (context && Object.keys(context).length) {
            output.push(
                "",
                "Context",
                JSON.stringify(context, null, 2)
            );
        }

        if (err.stack) {
            output.push(
                "",
                "Stack",
                err.stack
            );
        }

        output.push(
            "",
            "────────────────────────────────────────",
            ""
        );

        return output.join("\n");
    }

    async log(
        error,
        location = "Unknown",
        context,
        level = "error"
    ) {
        const entry = {
            timestamp: new Date(),
            level,
            location,
            error,
            context
        };

        try {
            const file = await this.ensureLogFile(level);

            await fs.appendFile(
                file,
                this.formatLog(entry),
                "utf8"
            );
        } catch (err) {
            console.error("Failed to write log:", err);
        }

        if (!this.enableConsole) return;

        LOG_CONSOLE[level](
            `${LOG_COLOR[level]}[${level.toUpperCase()}]\x1b[0m`,
            `[${location}]`,
            error instanceof Error
                ? error.message
                : error
        );

        if (
            process.env.NODE_ENV === "development" &&
            error instanceof Error &&
            error.stack
        ) {
            console.debug(
                "\x1b[90m%s\x1b[0m",
                error.stack
            );
        }
    }

    error(error, location, context) {
        return this.log(
            error,
            location,
            context,
            "error"
        );
    }

    warn(message, location, context) {
        return this.log(
            message,
            location,
            context,
            "warn"
        );
    }

    info(message, location, context) {
        return this.log(
            message,
            location,
            context,
            "info"
        );
    }
}

const systemLogger = new SystemLogger({
    enableConsole:
        process.env.NODE_ENV !== "production" ||
        process.env.DEBUG === "true"
});

export default systemLogger;
export { systemLogger };