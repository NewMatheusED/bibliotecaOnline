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
const pgSession = require('connect-pg-simple')(session);
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
    store: new pgSession({
        conString: `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}/${process.env.PGDATABASE}?sslmode=require`
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 } // 30min de sessão
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
    if (req.isAuthenticated()) {
        return next();
    }
    console.log('Usuário não autenticado');
    res.redirect('/login');
}

app.use((req, res, next) => { // middleware para verificar o tempo restante da sessão
    if (req.session.cookie) {
        const now = Date.now();
        const expires = req.session.cookie._expires;
        const remainingTime = expires - now;
        res.locals.sessionRemainingTime = remainingTime;
    } else {
        res.locals.sessionRemainingTime = 0;
    }
    next();
});

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
        id: user.id,
        sessionRemainingTime: res.locals.sessionRemainingTime
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
            userService.createUser(name, email, hash, (err) => {
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
                        if (err) {
                            console.log('Erro ao buscar usuário:', err);
                            res.status(500).send('An error occurred while fetching user');
                        } else {
                            res.redirect('/');
                        }
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
            try {
                // Logar o conteúdo da resposta para verificar se é um JSON válido
                console.log(response.data);
                if (response.data && response.data.volumeInfo) {
                    let book = response.data;
                    res.render('singleBook', { book: book });
                } else {
                    console.error('Resposta da API não contém os dados esperados');
                    res.status(500).send('Erro ao buscar detalhes do livro');
                }
            } catch (error) {
                console.error('Erro ao fazer parse do JSON:', error);
                res.status(500).send('Erro ao buscar detalhes do livro');
            }
        })
        .catch((error) => {
            console.error('Erro ao fazer requisição para a API:', error);
            res.status(500).send('Erro ao buscar detalhes do livro');
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
            return res.status(500).json({ message: 'Ocorreu um erro' });
        } else {
            console.log('Dados inseridos com sucesso');
            return res.status(200).json({ message: 'Dados inseridos com sucesso' });
        }
    });
});

app.post('/remover', ensureAuthenticated, (req, res) => {
    let title = req.body.title;

    bookService.deleteBook(req.user.id, title, (err, result) => {
        if (err) {
            console.log('Erro ao remover dados:', err);
            return res.status(500).json({ message: 'Ocorreu um erro ao remover o livro' });
        } else {
            console.log('Livro removido com sucesso');
            return res.status(200).json({ message: 'Livro removido com sucesso' });
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
    bookService.deleteBook(req.user.id, id, (err) => {
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
    userService.updatePrivilege(email, privilege, (err) => {
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
        renderMainPage(req, res, req.user, 'Você não tem permissão para acessar essa página');
    } else {
        userService.findById(req.params.user_id, (err, user) => {
            if (err) {
                console.log('Erro ao buscar usuário:', err);
                res.status(500).send('An error occurred while fetching user');
            } else {
                res.render('profile', { user: user });
            }
        });
    }
});

app.post('/profile/update', ensureAuthenticated, upload.single('profilePicture'), (req, res) => {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    let profilePicture = req.user.profilepicture;

    if (req.file) {
        profilePicture = `/img/profilePictures/${req.file.filename}`;
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (profilePicture) updatedData.profilepicture = profilePicture;

    if (newPassword) {
        userService.findById(userId, (err, user) => {
            if (err || !user) {
                console.error('Erro ao encontrar usuário:', err);
                return res.status(500).send('Erro ao atualizar perfil');
            }

            bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
                if (err || !isMatch) {
                    console.error('Senha atual incorreta:', err);
                    return res.status(400).send('Senha atual incorreta');
                }

                bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error('Erro ao hashear nova senha:', err);
                        return res.status(500).send('Erro ao atualizar perfil');
                    }
                    updatedData.password = hashedPassword;
                    userService.updateUser(userId, updatedData, (err) => {
                        if (err) {
                            console.error('Erro ao atualizar perfil:', err);
                            return res.status(500).send('Erro ao atualizar perfil');
                        }
                        console.log('Perfil atualizado com sucesso');
                        res.redirect('/profile/' + userId);
                    });
                });
            });
        });
    } else {
        userService.updateUser(userId, updatedData, (err) => {
            if (err) {
                console.error('Erro ao atualizar perfil:', err);
                return res.status(500).send('Erro ao atualizar perfil');
            }
            console.log('Perfil atualizado com sucesso');
            res.redirect('/profile/' + userId);
        });
    }
});

app.get('/delete/:user_id', ensureAuthenticated, (req, res) => {
    userService.deleteUser(req.params.user_id, (err) => {
        if (err) {
            console.log('Erro ao deletar usuário:', err);
            res.status(500).send('An error occurred while deleting user');
        } else {
            console.log('Usuário deletado com sucesso');
            res.redirect('/admin');
        }
    });
});

app.get('/changePassPage', ensureAuthenticated, (req, res) => {
    if (req.user.privilege != 'admin') {
        renderMainPage(req, res, req.user, 'Você não tem permissão para acessar essa página');
    } else {
        let userChange = req.query.user;
        userService.findById(userChange, (err, user) => {
            if (err) {
                console.log('Erro ao buscar usuário:', err);
                res.status(500).send('An error occurred while fetching user');
            } else {
                res.render('changePass', { userChange: userChange, userInfo: user.dataValues });
            }
        });
    }
});

app.post('/changePass', ensureAuthenticated, (req, res) => {
    if (req.user.privilege != 'admin') {
        renderMainPage(req, res, req.user, 'Você não tem permissão para acessar essa página');
    } else {
        const { user, newPass } = req.body;
        bcrypt.hash(newPass, 10, (err, hash) => {
            if (err) {
                console.log('Erro ao criptografar senha:', err);
                res.status(500).send({ success: false, message: 'An error occurred while encrypting password' });
            } else {
                userService.updateUser(user, { password: hash }, (err) => {
                    if (err) {
                        console.log('Erro ao atualizar senha:', err);
                        res.status(500).send({ success: false, message: 'An error occurred while updating password' });
                    } else {
                        console.log('Senha atualizada com sucesso');
                        res.send({ success: true });
                    }
                });
            }
        });
    }
});

module.exports = app;