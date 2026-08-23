// @file src/db/initDb.js

import { logger } from "#utils/terminal";

export const initializeDatabase = async () => {
    try {
        const { migrate } = await import("./migrate.js");

        await migrate();

        logger.success("Database synced with schema");

        return {
            success: true
        };
    } catch (error) {
        logger.error(`Migration Error: ${error.message}`);

        throw error;
    }
};