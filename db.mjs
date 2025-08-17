import "dotenv/config";
import { Pool } from "pg";

export const db = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// import { Pool } from "pg";
// import "dotenv/config";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false, // Neon ke liye
//   },
// });

// export const db = {
//   query: (text, params) => pool.query(text, params),
// };
