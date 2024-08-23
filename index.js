require('dotenv').config()
const express = require('express');
const port = 3000;
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const con = require('./db');
const bcrypt = require('bcrypt')

const key = process.env.GOOGLE_BOOKS_API_KEY;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(port, () => {
    console.log(`Server is running on link: http://localhost:${port}`);
})

function renderMainPage(res, extra) {
    axios.get(`https://www.googleapis.com/books/v1/volumes?q=javascript&key=${key}`)
    .then((response) => {
        res.render('index', { data: response.data.items, user: extra });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('An error occurred while fetching books');
    });
}

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('singin')
})

app.post('/registrar', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.log('Erro ao criptografar senha:', err);
            res.status(500).send('An error occurred while encrypting password');
        } else {
            const sql = `INSERT INTO usuarios (name, user, pass) VALUES (?, ?, ?)`;
            const values = [name, email, hash];
            con.query(sql, values, (err, result) => {
                if (err) {
                    console.log('Erro ao inserir usuário:', err);
                    res.status(500).send('An error occurred while inserting user');
                } else {
                    console.log('Usuário inserido com sucesso');
                    renderMainPage(res, name)
                }
            });
        }
    });
});

app.post('/logar', (req, res) => {
    let email = req.body.email;
    let pass = req.body.password;

    const sql = `SELECT * FROM usuarios WHERE user = ?`;
    con.query(sql, [email], (err, result) => {
        if (err) {
            console.log('Erro ao buscar usuário:', err);
            res.status(500).send('An error occurred while fetching user');
        } else {
            if (result.length === 0) {
                console.log('Usuário não encontrado');
                res.status(404).send('User not found');
            } else {
                const user = result[0];
                bcrypt.compare(pass, user.pass, (err, isMatch) => {
                    if (err) {
                        console.log('Erro ao comparar senhas:', err);
                        res.status(500).send('An error occurred while comparing passwords');
                    } else {
                        if (isMatch) {
                            console.log('Senha correta');
                            renderMainPage(res, user.name);
                        } else {
                            console.log('Senha incorreta');
                            res.status(401).send('Incorrect password');
                        }
                    }
                });
            }
        }
    });
});

app.get('/', (req, res) => {
    renderMainPage(res, '')
})

app.get('/search', (req, res) => {
    let searchTerm = req.query.q;
    axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${key}`)
    .then((response) => {
        res.render('index', { data: response.data.items });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('An error occurred while fetching books');
    })
})

app.post('/guardar', (req, res) => {
    let title = req.body.title;
    let author = req.body.author;
    let image = req.body.image;

    const sql = `INSERT INTO livros_guardados (titulo, autor, url_imagem) VALUES (?, ?, ?)`;
    const values = [title, author, image];
    con.query(sql, values, (err, result) => {
        if (err) {
            console.log('Erro ao inserir dados:', err);
            res.status(500).send('An error occurred while inserting data');
        } else {
            console.log('Dados inseridos com sucesso');
            res.redirect('/');
        }
    });
});

app.get('/livrosGuardados', (req, res) => {
    const sql = `SELECT * FROM livros_guardados`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log('Erro ao buscar dados:', err);
            res.status(500).send('An error occurred while fetching data');
        } else {
            res.render('guardados', { data: result });
        }
    });
})

app.get('/voltarHome', (req, res) => {
    res.redirect('/');
})

app.delete('/deletar', (req, res) => {
    const id = req.body.titulo;
    const query = 'DELETE FROM livros_guardados WHERE titulo = ?';
    con.query(query, id, (err, result) => {
        if (err) {
            console.log('Erro ao deletar livro:', err);
            res.status(500).send('An error occurred while deleting book');
        } else {
            console.log('Livro deletado com sucesso');
            res.redirect('/livrosGuardados');
        }
    });
})