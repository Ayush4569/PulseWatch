
import type { PoolClient } from "pg";
import pool from "./client.js";

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In compiled dist/, fallback to src/db/migrations if dist/db/migrations doesn't exist
let migrationsPath = path.resolve(__dirname, "migrations");
if (!fsSync.existsSync(migrationsPath)) {
    const srcMigrationsPath = path.resolve(process.cwd(), "src/db/migrations");
    if (fsSync.existsSync(srcMigrationsPath)) {
        migrationsPath = srcMigrationsPath;
    }
}

const readMigrationFiles = async (): Promise<string[]> => {
    const files = await fs.readdir(migrationsPath);

    return files
        .filter((file) => file.endsWith(".sql"))
        .sort((a, b) => a.localeCompare(b));
};

const createSchemaMigrationsTable = async (client: PoolClient) => {
    const query = `
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            file_name TEXT NOT NULL UNIQUE,
            executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `;

    await client.query(query);
};


const runMigrations = async () => {
    const client = await pool.connect();

    try {
        await createSchemaMigrationsTable(client);

        const migrationFiles = await readMigrationFiles();

        for (const file of migrationFiles) {
            const result = await client.query(
                `Select id FROM schema_migrations WHERE file_name=$1`, [file]
            )

            if (result.rows.length > 0) {
                console.log(`Skipping ${file}`);
                continue;
            }
            try {
                const sqlContent = await fs.readFile(
                    `${migrationsPath}/${file}`,
                    "utf-8"
                );

                await client.query("BEGIN");

                await client.query(sqlContent);

                await client.query(
                    `INSERT INTO schema_migrations (file_name)
                     VALUES ($1)`,
                    [file]
                );

                await client.query("COMMIT");

                console.log(`Migration ${file} executed successfully`);
            } catch (error) {
                await client.query("ROLLBACK");
                console.error(`Migration ${file} failed`);
                throw error;
            }
        }
    } finally {
        client.release()
    }

}

runMigrations()
    .then(() => {
        console.log("All migrations completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Migration process failed:", error);
        process.exit(1);
    });