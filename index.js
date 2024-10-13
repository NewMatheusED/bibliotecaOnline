require('dotenv').config();
require('./passport');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const userService = require('./services/userService');
const bookService = require('./services/bookService');
const passport = require('passport');
const session = require('express-session');
const sql = require('./db');
const renderMainPage = require('./routes/renderMainPage');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1h de sessão
}));

app.use(passport.initialize());
app.use(passport.session());

sql`SELECT version()`
  .then(result => console.log('Conexão com o banco de dados estabelecida com sucesso. Versão do PostgreSQL:', result[0].version))
  .catch(err => console.error('Falha ao conectar ao banco de dados:', err));

app.listen(port, () => {
    console.log(`Server is running on link: http://localhost:${port}`);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.isAuthenticated) {
        return next();
    }
    console.log('Usuário não autenticado');
    res.redirect('/login');
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/img/profilePictures')
    },
    filename: function(req, file, cb) {
        cb(null, `${req.user.id}-profile.png`)
    }
});

const upload = multer({ storage: storage });

const profilePicturesDir = path.join(__dirname, 'public', 'img', 'profilePictures');
if (!fs.existsSync(profilePicturesDir)) {
    fs.mkdirSync(profilePicturesDir, { recursive: true });
}

app.get('/header-data', ensureAuthenticated, (req, res) => {
    const user = req.user;

    res.json({
        name: user.name,
        email: user.email,
        profilePicture: user.profilepicture,
        privilege: user.privilege,
        id: user.id
    });
});

app.post('/registrar', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.log('Erro ao criptografar senha:', err);
            res.status(500).send('An error occurred while encrypting password');
        } else {
            userService.createUser(name, email, hash, (err, result) => {
                if (err) {  
                    if(err.errorCode == '1001') {
                        console.log('Usuário já cadastrado');
                        res.render('singin', { message: 'Email já cadastrado' });
                    } else {
                        console.log('Erro ao inserir usuário:', err);
                        res.status(500).send('An error occurred while inserting user');
                    }
                } else {
                    console.log('Usuário inserido com sucesso');
                    userService.getUser(email, (err, user) => {
                        return res.redirect('/');
                    });
                }
            });
        }
    });
});

app.post('/login', function(req, res, next) {
    passport.authenticate('login', function(err, user, info) {
      if (err) {
        if (err.errorCode === 1002) {
            return res.redirect('/login?error=true');
        }
        return next(err);
      }
      if (!user) { return res.redirect('/login?error=true'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/');
      });
    })(req, res, next);
});

app.get('/logout', (req, res, next) => {
    req.session.destroy(function (err) {
        if (err) { return next(err); }
        req.logout(() => {});
        res.redirect('login');
    });
});

app.get('/', ensureAuthenticated, (req, res) => {
    renderMainPage(req, res, req.user, '');
});

app.get('/login', (req, res) => {
    res.render('login', { message: req.query.error ? 'Usuário ou senha inválidos' : '' });
});

app.get('/singleBook', ensureAuthenticated, (req, res) => {
    let id = req.query.id;
    let url = `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    axios.get(url)
        .then((response) => {
            let book = response.data;
            res.render('singleBook', { book: book });
        });
});

app.get('/register', (req, res) => {
    res.render('singin', { message: '' });
});

app.get('/search', ensureAuthenticated, (req, res) => {
    let searchTerm = req.query.q;
    req.session.lastSearch = searchTerm;
    renderMainPage(req, res, req.user, '', searchTerm);
});

app.post('/filter', ensureAuthenticated, (req, res) => {
    let subject = req.body.genre;
    renderMainPage(req, res, req.user, '', '', subject);
});

app.get('/admin', ensureAuthenticated, (req, res) => {
    if (req.user.privilege === 'admin') {
        userService.listUsers((err, result) => {
            if (err) {
                console.log('Erro ao buscar usuários:', err);
                res.status(500).send('An error occurred while fetching users');
            } else {
                res.render('admin', { users: result, selectedUser: req.user });
            }
        });
    } else {
        renderMainPage(req, res, req.user, 'Você não tem permissão para acessar essa página');
    }
});

app.post('/guardar', ensureAuthenticated, (req, res) => {
    let title = req.body.title;
    let author = req.body.author;
    let image = req.body.image;

    bookService.createBook(req.user.id, title, author, image, (err, result) => {
        if (err) {
            console.log('Erro ao inserir dados:', err);
            if (err.errorCode === 1001) {
                renderMainPage(req, res, req.user, 'Livro já guardado');
            } else {
                renderMainPage(req, res, req.user, 'Ocorreu um erro');
            }
        } else {
            console.log('Dados inseridos com sucesso');
            res.redirect('/');
        }
    });
});

app.get('/livrosGuardados', ensureAuthenticated, (req, res) => {
    bookService.listBooks(req.user.id, (err, result) => {
        if (err) {
            console.log('Erro ao buscar dados:', err);
            res.status(500).send('An error occurred while fetching data');
        } else {
            res.render('guardados', { data: result, userId: req.user.id });
        }
    });
});

app.get('/voltarHome', ensureAuthenticated, (req, res) => {
    res.redirect('/');
});

app.post('/deletar', ensureAuthenticated, (req, res) => {
    const id = req.body.titulo;
    bookService.deleteBook(id, (err, result) => {
        if (err) {
            console.log('Erro ao deletar livro:', err);
            res.status(500).send('An error occurred while deleting book');
        } else {
            console.log('Livro deletado com sucesso');
            res.redirect('/livrosGuardados');
        }
    });
});

app.post('/updatePrivilege', ensureAuthenticated, (req, res) => {
    const { email, privilege } = req.body;
    userService.updatePrivilege(email, privilege, (err, result) => {
        if (err) {
            console.log('Erro ao atualizar privilégio:', err);
            res.status(500).json({ message: 'An error occurred while updating privilege' });
        } else {
            console.log('Privilégio atualizado com sucesso');
            res.json({ message: 'Privilégio atualizado com sucesso' });
        }
    });
});

app.get('/profile/:user_id', ensureAuthenticated, (req, res) => {
    if (req.user.id != req.params.user_id) {
        if (req.user.privilege !== 'admin') {
            renderMainPage(req, res, req.user, 'Você não tem permissão para acessar essa página');
        } else {
            userService.findById(req.params.user_id, (err, user) => {
                if (err) {
                    console.log('Erro ao buscar usuário:', err);
                    res.status(500).send('An error occurred while fetching user');
                } else {
                    return res.render('profile', { user: user });
                }
            });
        }
    } else {
        userService.findById(req.params.user_id, (err, user) => {
            if (err) {
                console.log('Erro ao buscar usuário:', err);
                res.status(500).send('An error occurred while fetching user');
            } else {
                return res.render('profile', { user: user });
            }
        });
    }
});

app.post('/profile/update', ensureAuthenticated, upload.single('profilePicture'), async (req, res) => {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    let profilePicture = req.user.profilepicture;

    if (req.file) {
        profilePicture = `/img/profilePictures/${req.file.filename}`;
    }

    try {
        const updatedData = {};
        if (name) updatedData.name = name;
        if (profilePicture) updatedData.profilepicture = profilePicture;
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updatedData.password = hashedPassword;
        }

        await userService.updateUser(userId, updatedData, (err, result) => {
            if (err) {
                console.log('Erro ao atualizar perfil:', err);
                res.status(500).send('Erro ao atualizar perfil');
            } else {
                console.log('Perfil atualizado com sucesso');
                res.redirect('/profile/' + userId);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar perfil');
    }
});

app.get('/delete/:user_id', ensureAuthenticated, (req, res) => {
    userService.deleteUser(req.params.user_id, (err, result) => {
        if (err) {
            console.log('Erro ao deletar usuário:', err);
            res.status(500).send('An error occurred while deleting user');
        } else {
            console.log('Usuário deletado com sucesso');
            res.redirect('/admin');
        }
    });
});

module.exports = app;