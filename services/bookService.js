const Book = require('../models/books');

module.exports = {
  createBook: async function(user_id, title, author, image, callback) {
    try {
      const existingBook = await Book.findOne({ where: { titulo: title } });
      if (existingBook) {
        return callback({ error: 'Livro já cadastrado', errorCode: 1001 });
      }
      await Book.create({ user_id, titulo: title, autor: author, url_imagem: image });
      callback(null);
    } catch (err) {
      callback(err);
    }
  },

  listBooks: async function(user_id, callback) {
    try {
      const books = await Book.findAll({ where: { user_id } });
      callback(null, books);
    } catch (err) {
      callback(err);
    }
  },

  countBooks: async function(user_id, callback) {
    try {
      const count = await Book.count({ where: { user_id } });
      callback(null, count);
    } catch (err) {
      callback(err);
    }
  },

  deleteBook: async function(title, callback) {
    try {
      await Book.destroy({ where: { titulo: title } });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
};