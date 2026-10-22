const mysql = require('mysql2/promise');

// A connection pool keeps a few reusable connections to MySQL.
// Credentials come from environment variables (see .env.example).
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todo_app',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
