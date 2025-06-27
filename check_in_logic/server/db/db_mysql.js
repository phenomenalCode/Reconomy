// db/db_mysql.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.HOST,           // Not DB_HOST, use HOST
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'd70v8guajikn7536', // fallback if missing in env
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: Test connection immediately on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database (Promise Pool)');
    connection.release();
  } catch (err) {
    console.error('MySQL connection failed:', err);
  }
}

testConnection();

module.exports = pool;
