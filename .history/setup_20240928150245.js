const fs = require('fs');
const postgres = require('postgres');
require('pg')
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
    const result = await sql`select version()`;
    console.log(result);
}
  
getPgVersion();

fs.readFile('setup.sql', 'utf8', async (err, data) => {
    if (err) {
        console.log('Erro ao ler o arquivo SQL:', err);
    } else {
        try {
            const result = await sql.unsafe(data);
            console.log('Arquivo SQL executado com sucesso:', result);
        } catch (err) {
            console.log('Erro ao executar o arquivo SQL:', err);
        } finally {
            await sql.end();
        }
    }
});