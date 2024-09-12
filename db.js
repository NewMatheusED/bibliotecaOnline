const { Client } = require('pg');
require('dotenv').config();

const con = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

con.connect((err) => {
    if (err) {
        console.log('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados');
    }
});

module.exports = con;