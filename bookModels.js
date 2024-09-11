const con  = require('./db');

module.exports = {
    createBook: function(title, author, image, callback) {
        const sql = `INSERT INTO livros_guardados (titulo, autor, url_imagem) VALUES (?, ?, ?)`;
        const values = [title, author, image];
        con.query(sql, values, callback);
    },

    listBooks: function(callback) {
        const sql = `SELECT * FROM livros_guardados`;
        con.query(sql, callback);
    },
    
    deleteBook: function(id, callback) {
        const sql = `DELETE FROM livros_guardados WHERE titulo = ?`;
        const values = [id];
        con.query(sql, values, callback);
    }
}