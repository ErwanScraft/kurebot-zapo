// @file src/db/initDb.js
import chalk from "chalk";
import { migrate } from "./migrate.js";

export const initializeDatabase = async () => {
  try {
    await migrate();
    console.log(chalk.green("✔ Database synced with schema"));
    return { success: true };
  } catch (error) {
    console.error(chalk.red("✘ Migration Error:"), error.message);
    throw error;
  }
};