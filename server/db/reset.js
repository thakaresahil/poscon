import { createClient } from "./client.js";

async function reset() {
  const db = createClient();
  await db.connect();
  try {
    await db.query("DROP SCHEMA public CASCADE");
    await db.query("CREATE SCHEMA public");
    console.log("Database cleared");
  } finally {
    await db.end();
  }
}

reset().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
