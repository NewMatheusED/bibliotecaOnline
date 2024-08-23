const mysql = require('mysql2');
require('dotenv').config();

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

con.connect((err) => {
    if (err) {
        console.log('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados');
    }
});

module.exports = con;