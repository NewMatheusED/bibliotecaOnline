const con = require('../db');

module.exports = {
    createUser: function(name, email, password, callback) {
        const checkSql = `SELECT * FROM usuarios WHERE user = ?`;
        con.query(checkSql, [email], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length > 0) {
                return callback({ error: 'Usuário já cadastrado', errorCode: 1001 });
            }
            const sql = `INSERT INTO usuarios (name, user, password) VALUES (?, ?, ?)`;
            const values = [name, email, password];
            con.query(sql, values, callback);
        });
    },

    listUsers: function(callback) {
        const sql = `SELECT * FROM usuarios`;
        con.query(sql, callback);
    },

    getUser: function(email, callback) {
        const sql = `SELECT * FROM usuarios WHERE user = ?`;
        con.query(sql, [email], (err, result) => {
            if (err) {
                return callback(err);
            } else if (result.length == 0) {
                return callback({ error: 'Usuário não encontrado', errorCode: 1002 });
            }
            callback(null, result);
        });
    },

    findById: function(id, callback) {
        const sql = `SELECT * FROM usuarios WHERE id = ?`;
        con.query(sql, [id], callback);
    }
};