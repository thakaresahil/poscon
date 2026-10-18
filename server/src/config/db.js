import pg from "pg";
import "dotenv/config";

// Hosted databases such as Neon give a single connection string and require SSL.
// Locally the separate PG_* variables are used instead.
export const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: true },
    }
  : {
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,
    };

const pool = new pg.Pool(dbConfig);

pool.on("error", (error) => {
  console.error("Unexpected database error", error);
});

// Runs callback inside a transaction, rolling back if it throws
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
