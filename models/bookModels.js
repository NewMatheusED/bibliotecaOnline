const sql = require('../db');

module.exports = {
    createBook: async function(title, author, image, callback) {
        try {
            const result = await sql`SELECT * FROM livros_guardados WHERE titulo = ${title}`;
            if (result.length > 0) {
                return callback({ error: 'Livro já cadastrado', errorCode: 1001 });
            }
            await sql`INSERT INTO livros_guardados (titulo, autor, url_imagem) VALUES (${title}, ${author}, ${image})`;
            callback(null);
        } catch (err) {
            callback(err);
        }
    },

    listBooks: async function(callback) {
        try {
            const result = await sql`SELECT * FROM livros_guardados`;
            callback(null, result);
        } catch (err) {
            callback(err);
        }
    },

    deleteBook: async function(id, callback) {
        try {
            await sql`DELETE FROM livros_guardados WHERE titulo = ${id}`;
            callback(null);
        } catch (err) {
            callback(err);
        }
    }
};