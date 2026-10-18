import pg from "pg";
import "dotenv/config";

export const dbConfig = {
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

export default pool;
