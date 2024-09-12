const con = require('../db');

module.exports = {
    createUser: function(name, email, password, callback) {
        const checkSql = `SELECT * FROM usuarios WHERE user = $1`;
        con.query(checkSql, [email], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.rows.length > 0) {
                return callback({ error: 'Usuário já cadastrado', errorCode: 1001 });
            }
            const sql = `INSERT INTO usuarios (name, user, password) VALUES ($1, $2, $3)`;
            const values = [name, email, password];
            con.query(sql, values, callback);
        });
    },

    listUsers: function(callback) {
        const sql = `SELECT * FROM usuarios`;
        con.query(sql, (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result.rows);
        });
    },

    getUser: function(email, callback) {
        const sql = `SELECT * FROM usuarios WHERE user = $1`;
        con.query(sql, [email], (err, result) => {
            if (err) {
                return callback(err);
            } else if (result.rows.length == 0) {
                return callback({ error: 'Usuário não encontrado', errorCode: 1002 });
            }
            callback(null, result.rows);
        });
    },

    findById: function(id, callback) {
        const sql = `SELECT * FROM usuarios WHERE id = $1`;
        con.query(sql, [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result.rows);
        });
    }
};