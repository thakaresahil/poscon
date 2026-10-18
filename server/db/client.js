import pg from "pg";
import { dbConfig } from "../src/config/db.js";

export const createClient = () => new pg.Client(dbConfig);
