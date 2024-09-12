const con  = require('../db');

module.exports = {
    createBook: function(title, author, image, callback) {
        const checkSql = `SELECT * FROM livros_guardados WHERE titulo = $1`;
        con.query(checkSql, [title], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.rows.length > 0) {
                return callback({ error: 'Livro já cadastrado', errorCode: 1001 });
            } else {
                const sql = `INSERT INTO livros_guardados (titulo, autor, url_imagem) VALUES ($1, $2, $3)`;
                const values = [title, author, image];
                con.query(sql, values, callback);
            }
        });
    },

    listBooks: function(callback) {
        const sql = `SELECT * FROM livros_guardados`;
        con.query(sql, (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result.rows);
        });
    },
    
    deleteBook: function(id, callback) {
        const sql = `DELETE FROM livros_guardados WHERE titulo = $1`;
        const values = [id];
        con.query(sql, values, callback);
    }
};