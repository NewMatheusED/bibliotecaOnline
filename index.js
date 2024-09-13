require('dotenv').config();
require('./passport');
const express = require('express');
const port = 3000;
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const bcrypt = require('bcryptjs')
const User = require('./models/userModels')
const Book = require('./models/bookModels')
const passport = require('passport');
const session = require('express-session');
const e = require('express');
const { render } = require('ejs');
const sql = require('./db');

const key = process.env.GOOGLE_BOOKS_API_KEY;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

sql`SELECT version()`
  .then(result => console.log('Conexão com o banco de dados estabelecida com sucesso. Versão do PostgreSQL:', result[0].version))
  .catch(err => console.error('Falha ao conectar ao banco de dados:', err));

app.listen(port, () => {
    console.log(`Server is running on link: http://localhost:${port}`);
})

function renderMainPage(req, res, extra, message, bookQuery = req.session.lastSearch || 'javascript') { 
    axios.get(`https://www.googleapis.com/books/v1/volumes?q=${bookQuery}&key=${key}`)
    .then((response) => {
        res.render('index', { data: response.data.items, user: extra, message: message});
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('An error occurred while fetching books');
    });
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}

app.post('/registrar', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.log('Erro ao criptografar senha:', err);
            res.status(500).send('An error occurred while encrypting password');
        } else {
            User.createUser(name, email, hash, (err, result) => {
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
                    User.getUser(email, (err, user) => {
                        renderMainPage(req, res, user, '');
                    })
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

app.get('/logout', (req, res, next) => { // pelo amor de deus, não mexe nisso, demorou para funcionar
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
})

app.get('/register', (req, res) => {
    res.render('singin', { message: '' });
})

app.get('/search', ensureAuthenticated, (req, res) => {
    let searchTerm = req.query.q;
    req.session.lastSearch = searchTerm;
    renderMainPage(req, res, req.user, '', searchTerm);
})

app.post('/guardar', ensureAuthenticated, (req, res) => {
    let title = req.body.title;
    let author = req.body.author;
    let image = req.body.image;

    Book.createBook(title, author, image, (err, result) => {
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
    Book.listBooks((err, result) => {
        if (err) {
            console.log('Erro ao buscar dados:', err);
            res.status(500).send('An error occurred while fetching data');
        } else {
            res.render('guardados', { data: result });
        }
    });
})

app.get('/voltarHome', ensureAuthenticated, (req, res) => {
    res.redirect('/');
})

app.post('/deletar', ensureAuthenticated, (req, res) => {
    const id = req.body.titulo;
    Book.deleteBook(id, (err, result) => {
        if (err) {
            console.log('Erro ao deletar livro:', err);
            res.status(500).send('An error occurred while deleting book');
        } else {
            console.log('Livro deletado com sucesso');
            res.redirect('/livrosGuardados');
        }
    });
})