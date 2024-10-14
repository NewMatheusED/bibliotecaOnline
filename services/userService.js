const User = require('../models/user');

module.exports = {
  createUser: function(name, email, password, callback) {
    User.findOne({ where: { email } })
      .then(existingUser => {
        if (existingUser) {
          return callback({ error: 'Usuário já cadastrado', errorCode: 1001 });
        }
        return User.create({ name, email, password, privilege: 'user', profilepicture: '/img/defaultUserProfile.png' });
      })
      .then(() => {
        callback(null);
      })
      .catch(err => {
        callback(err);
      });
  },

  listUsers: function(callback) {
    User.findAll()
      .then(users => {
        callback(null, users);
      })
      .catch(err => {
        callback(err);
      });
  },

  getUser: function(email, callback) {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return callback({ error: 'Usuário não encontrado', errorCode: 1002 });
        }
        callback(null, user);
      })
      .catch(err => {
        callback(err);
      });
  },

  findById: function(id, callback) {
    User.findByPk(id)
      .then(user => {
        callback(null, user);
      })
      .catch(err => {
        callback(err);
      });
  },

  updatePrivilege: function(email, privilege, callback) {
    User.update({ privilege }, { where: { email } })
      .then(() => {
        callback(null);
      })
      .catch(err => {
        callback(err);
      });
  },

  deleteUser: function(id, callback) {
    User.destroy({ where: { id } })
      .then(() => {
        callback(null);
      })
      .catch(err => {
        callback(err);
      });
  },

  updateUser: function(id, updatedData, callback) {
    User.update(updatedData, { where: { id } })
      .then(() => {
        callback(null);
      })
      .catch(err => {
        callback(err);
      });
  }
};