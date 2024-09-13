const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/userModels');

passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.getUser(email, (err, user) => {
        if (err) {
            return done(err);
        }
        bcrypt.compare(password, user[0].password, (err, isMatch) => {
            if (err) { return done(err); }
            if (isMatch) {
                return done(null, user[0]);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = passport;