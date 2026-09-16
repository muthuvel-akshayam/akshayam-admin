import { config } from 'dotenv';
config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log("DB connected:", res.rows[0]);
    client.release();
    pool.end();
  } catch (err) {
    console.error("Pool connect error:", err);
  }
}
run();
