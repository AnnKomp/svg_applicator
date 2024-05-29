import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
      rejectUnauthorized: false
    }
  });

  export async function query(text, params) {
    const start = Date.now();
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      console.log('executed query', { text, duration, rows: res.rowCount });
      return res.rows;
    } finally {
      client.release();
    }
  }
