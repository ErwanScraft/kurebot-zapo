// @file src/db/migrate.js

import pool from "./connection.js";
import { schema } from "./schema.js";
import { logger } from "#utils/terminal";

export const migrate = async () => {
    for (const tableName of Object.keys(schema)) {
        const columns = schema[tableName];

        const columnDefinitions = Object.entries(columns)
            .map(([name, definition]) => {
                if (name === "PRIMARY") {
                    return definition;
                }

                return `${name} ${definition}`;
            })
            .join(", ");

        await pool.execute(
            `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`
        );

        const [existingColumns] = await pool.execute(
            `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = ?`,
            [tableName]
        );

        const existingColumnNames = existingColumns.map(
            column => column.COLUMN_NAME
        );

        for (const [columnName, definition] of Object.entries(columns)
            .filter(([name]) => name !== "PRIMARY")) {

            if (existingColumnNames.includes(columnName)) {
                continue;
            }

            logger.info(
                `ADD COLUMN ${columnName} -> ${tableName}`
            );

            await pool.execute(
                `ALTER TABLE ${tableName}
                 ADD COLUMN ${columnName} ${definition}`
            );
        }

        if (columns.PRIMARY) {
            const [primaryKeys] = await pool.execute(
                `SELECT COLUMN_NAME
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                 WHERE TABLE_SCHEMA = DATABASE()
                 AND TABLE_NAME = ?
                 AND CONSTRAINT_NAME = 'PRIMARY'
                 ORDER BY ORDINAL_POSITION`,
                [tableName]
            );

            const currentPrimary = primaryKeys
                .map(key => key.COLUMN_NAME)
                .join(", ");

            const expectedPrimary = columns.PRIMARY
                .replace(/^PRIMARY KEY\s*\(/i, "")
                .replace(/\)$/, "")
                .trim();

            if (currentPrimary !== expectedPrimary) {
                logger.info(
                    `SYNC PRIMARY KEY -> ${tableName}`
                );

                if (currentPrimary) {
                    await pool.execute(
                        `ALTER TABLE ${tableName}
                         DROP PRIMARY KEY`
                    );
                }

                await pool.execute(
                    `ALTER TABLE ${tableName}
                     ADD PRIMARY KEY (${expectedPrimary})`
                );
            }
        }

        for (const existingColumn of existingColumnNames) {
            if (Object.keys(columns).includes(existingColumn)) {
                continue;
            }

            logger.info(
                `DROP COLUMN ${existingColumn} -> ${tableName}`
            );

            await pool.execute(
                `ALTER TABLE ${tableName}
                 DROP COLUMN ${existingColumn}`
            );
        }
    }
};