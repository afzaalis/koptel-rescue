require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  apikey: process.env.GEMINI_API_KEY,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.connect()
    .then(() => {
        console.log('\x1b[32m',' Connected to NeonDB.');
    })
    .catch((err) => {
        //ANSI escape codes untuk warna merah
        console.error('\x1b[31m',' Failed to connect to PostgreSQL database:', err);
        process.exit(1);
    });

module.exports = pool;
