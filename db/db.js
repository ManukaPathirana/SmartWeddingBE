const mssql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getPool() {
  try {
    if (pool) {
      // If pool exists and is connected, return it
      if (pool.connected) return pool;
      // If pool exists but not connected, try to connect
      await pool.connect();
      return pool;
    }
    pool = await new mssql.ConnectionPool(config).connect();
    return pool;
  } catch (err) {
    console.error('MSSQL connection error:', err);
    throw err;
  }
}

module.exports = {
  sql: mssql,
  connect: getPool
};
