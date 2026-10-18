import { execSync } from "child_process";
import pg from "pg";
import "./testEnv.js";

// Creates the test database if needed, then rebuilds it from the migrations and seed data
export default async function globalSetup() {
  const admin = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    database: "postgres",
  });
  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [
    process.env.PG_DATABASE,
  ]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${process.env.PG_DATABASE}"`);
  }
  await admin.end();

  execSync("node db/reset.js && node db/migrate.js && node db/seed.js", {
    env: process.env,
    stdio: "ignore",
  });
}
