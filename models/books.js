const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  autor: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  url_imagem: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'livros_guardados',
  timestamps: false
});

module.exports = Book;