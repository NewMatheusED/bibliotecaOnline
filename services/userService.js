const User = require('../models/user');

module.exports = {
  createUser: async function(name, email, password, callback) {
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return callback({ error: 'Usuário já cadastrado', errorCode: 1001 });
      }
      await User.create({ name, email, password, privilege: 'user', profilepicture: '/img/defaultUserProfile.png' });
      callback(null);
    } catch (err) {
      callback(err);
    }
  },

  listUsers: async function(callback) {
    try {
      const users = await User.findAll();
      callback(null, users);
    } catch (err) {
      callback(err);
    }
  },

  getUser: async function(email, callback) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return callback({ error: 'Usuário não encontrado', errorCode: 1002 });
      }
      callback(null, user);
    } catch (err) {
      callback(err);f
    }
  },

  findById: async function(id, callback) {
    try {
      const user = await User.findByPk(id);
      callback(null, user);
    } catch (err) {
      callback(err);
    }
  },

  updatePrivilege: async function(email, privilege, callback) {
    try {
      await User.update({ privilege }, { where: { email } });
      callback(null);
    } catch (err) {
      callback(err);
    }
  },

  deleteUser: async function(id, callback) {
    try {
      await User.destroy({ where: { id } });
      callback(null);
    } catch (err) {
      callback(err);
    }
  },

  updateUser: async function(id, updatedData, callback) {
    try {
      await User.update(updatedData, { where: { id } });
    } catch (err) {
      callback(err);
    }
  }
};