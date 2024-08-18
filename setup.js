// setup.js
const mysql = require('mysql2');
const fs = require('fs');

const con = mysql.createConnection({
    host: '[seu host]',
    user: '[seu usuário]',
    password: '[sua senha]',
    database: '[seu banco de dados]',
});

fs.readFile('setup.sql', 'utf8', (err, data) => {
    if (err) {
        console.log('Erro ao ler o arquivo SQL:', err);
    } else {
        con.query(data, (err, results) => {
            if (err) {
                console.log('Erro ao executar o arquivo SQL:', err);
            } else {
                console.log('Tabelas criadas com sucesso');
            }
        });
    }
});