const Book = require('../models/books');

module.exports = {
  createBook: function(user_id, title, author, image, callback) {
    Book.findOne({ where: { titulo: title, user_id } })
      .then(existingBook => {
        if (existingBook) {
          return callback({ error: 'Livro já cadastrado', errorCode: 1001 });
        }
        return Book.create({ user_id, titulo: title, autor: author, url_imagem: image });
      })
      .then(() => {
        callback(null, { message: 'Livro cadastrado com sucesso' });
      })
      .catch(err => {
        callback(err);
      });
  },

  listBooks: function(user_id, callback) {
    Book.findAll({ where: { user_id } })
      .then(books => {
        callback(null, books);
      })
      .catch(err => {
        callback(err);
      });
  },

  deleteBook: function(user_id, title, callback) {
    Book.findOne({ where: { user_id, titulo: title } })
      .then(book => {
        if (!book) {
          return callback({ error: 'Livro não encontrado', errorCode: 1002 });
        }
        return book.destroy();
      })
      .then(() => {
        callback(null, { message: 'Livro removido com sucesso' });
      })
      .catch(err => {
        callback(err);
      });
  }
};