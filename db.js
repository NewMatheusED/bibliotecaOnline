const postgres = require('postgres');
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
PGPASSWORD = decodeURIComponent(PGPASSWORD);

const sql = postgres({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: 'require',
    connection: {
      options: `project=${ENDPOINT_ID}`,
    },
  });

  async function getPgVersion() {
    try {
        await sql.connect();
        console.log('Connected to PostgreSQL database');
    } catch (error) {
        console.error('Failed to connect to PostgreSQL database:', error);
    }
  }
  
  getPgVersion();

module.exports = sql;