const fs = require('fs');
const { Client } = require('pg');

const con = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

con.connect();

fs.readFile('setup.sql', 'utf8', (err, data) => {
    if (err) {
        console.log('Erro ao ler o arquivo SQL:', err);
    } else {
        con.query(data, (err, results) => {
            if (err) {
                console.log('Erro ao executar o arquivo SQL:', err);
            }
            con.end();
        });
    }
});