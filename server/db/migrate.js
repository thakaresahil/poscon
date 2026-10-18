import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "./client.js";

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations"
);

async function migrate() {
  const db = createClient();
  await db.connect();
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const applied = await db.query("SELECT name FROM schema_migrations");
    const done = new Set(applied.rows.map((row) => row.name));

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (done.has(file)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await db.query("BEGIN");
      try {
        await db.query(sql);
        await db.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          file,
        ]);
        await db.query("COMMIT");
        console.log(`Applied ${file}`);
      } catch (error) {
        await db.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${error.message}`);
      }
    }
    console.log("Database is up to date");
  } finally {
    await db.end();
  }
}

migrate().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
