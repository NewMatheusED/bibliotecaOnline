const express = require('express');
const port = 3000;
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const con = require('./db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(port, () => {
    console.log(`Server is running on link: http://localhost:${port}`);
})

app.get('/', (req, res) => {
    axios.get('https://www.googleapis.com/books/v1/volumes?q=javascript')
    .then((response) => {
        res.render('index', { data: response.data.items });
    })
    .catch((error) => {
        console.log(error);
    });
})

app.get('/search', (req, res) => {
    let searchTerm = req.query.q;
    axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}`)
    .then((response) => {
        res.render('index', { data: response.data.items });
    })
    .catch((error) => {
        console.log(error);
    })
})

app.get('/guardar', (req, res) => {
    let title = req.query.title;
    let author = req.query.author;
    let image = req.query.image;

    const sql = `INSERT INTO livros_guardados (titulo, autor, url_imagem) VALUES (?, ?, ?)`;
    const values = [title, author, image];
    con.query(sql, values, (err, result) => {
        if (err) {
            console.log('Erro ao inserir dados:', err);
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
        } else {
            res.render('guardados', { data: result });
        }
    });
})

app.get('/voltarHome', (req, res) => {
    res.redirect('/');
})