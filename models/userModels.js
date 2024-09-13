const sql = require('../db');

module.exports = {
    createUser: async function(name, email, password, callback) {
        try {
            const result = await sql`SELECT * FROM usuarios WHERE username = ${email}`;
            if (result.length > 0) {
                return callback({ error: 'Usuário já cadastrado', errorCode: 1001 });
            }
            await sql`INSERT INTO usuarios (name, username, password) VALUES (${name}, ${email}, ${password})`;
            callback(null);
        } catch (err) {
            callback(err);
        }
    },

    listUsers: async function(callback) {
        try {
            const result = await sql`SELECT * FROM usuarios`;
            callback(null, result);
        } catch (err) {
            callback(err);
        }
    },

    getUser: async function(email, callback) {
        try {
            const result = await sql`SELECT * FROM usuarios WHERE username = ${email}`;
            if (result.length == 0) {
                return callback({ error: 'Usuário não encontrado', errorCode: 1002 });
            }
            callback(null, result[0]);
        } catch (err) {
            callback(err);
        }
    },

    findById: async function(id, callback) {
        try {
            const result = await sql`SELECT * FROM usuarios WHERE id = ${id}`;
            callback(null, result[0]);
        } catch (err) {
            callback(err);
        }
    }
};