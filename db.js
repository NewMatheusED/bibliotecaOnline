const mysql = require('mysql2');

const con = mysql.createConnection({
    host: '[seu host]',
    user: '[seu usuário]',
    password: '[sua senha]',
    database: '[seu banco de dados]',
});

con.connect((err) => {
    if (err) {
        console.log('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados');
    }
});

module.exports = con;