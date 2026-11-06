import { config } from "../config/env.js";
import { Pool } from "pg";

const connectionString = config.DATABASE_URL;
if (!connectionString) throw new Error("DB URL ABSENT!!");

const isProduction = config.NODE_ENV === "production";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl:
    isProduction &&
    !connectionString.includes("localhost") &&
    !connectionString.includes("127.0.0.1") &&
    !connectionString.includes("@postgres:")
      ? { rejectUnauthorized: false }
      : undefined,
});

pool.on("error", (error) => {
  console.error("Unexpected error on idle pg client", error);
});

export default pool;