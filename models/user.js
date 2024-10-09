const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  privilege: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  profilepicture: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '/img/defaultUserProfile.png'
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

module.exports = User;