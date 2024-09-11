const con = require('./db');

module.exports = {
    createUser: function(name, email, password, callback) {
        const sql = `INSERT INTO usuarios (name, user, pass) VALUES (?, ?, ?)`;
        const values = [name, email, password];
        con.query(sql, values, callback);
    },

    listUsers: function(callback) {
        const sql = `SELECT * FROM usuarios`;
        con.query(sql, callback);
    },

    getUser: function(email, callback) {
        const sql = `SELECT * FROM usuarios WHERE user = ?`;
        con.query(sql, [email], callback);
    }
};