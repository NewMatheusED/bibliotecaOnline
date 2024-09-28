const sql = require('../db');

module.exports = {

    createUser: async function(name, email, password, callback) {
        try {
            const result = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
            if (result.length > 0) {
                return callback({ error: 'Usuário já cadastrado', errorCode: 1001 });
            }
            await sql`INSERT INTO usuarios (name, email, password, privilege) VALUES (${name}, ${email}, ${password}, 'user')`;
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
            const result = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
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
    },

    updatePrivilege: async function(email, privilege, callback) {
        try {
            await sql `UPDATE usuarios SET privilege = ${privilege} WHERE email = ${email}`;
            callback(null);
        } catch (err) {
            callback(err);
        }
    },

    deleteUser: async function(email, callback) {
        try {
            await sql `DELETE FROM usuarios WHERE email = ${email}`;
            callback(null);
        } catch (err) {
            callback(err);
        }
    }
};