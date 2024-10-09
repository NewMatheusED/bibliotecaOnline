require('dotenv').config();
const axios = require('axios');
const bookService = require('../services/bookService');

const key = process.env.GOOGLE_BOOKS_API_KEY;
const searchDefault = 'javascript'; // Valor padrão de pesquisa

function renderMainPage(req, res, extra, message, bookQuery = req.session.lastSearch, subject) { 
    // Defina valores padrão se bookQuery ou subject não estiverem definidos
    bookQuery = bookQuery || '';
    subject = subject || '';

    let query = '';
    if (subject) {
        query = `subject:${subject}`;
    } else if (bookQuery) {
        query = bookQuery;
    } else {
        query = searchDefault;
    }

    let url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${key}`;

    console.log(url);

    axios.get(url)
    .then((response) => {
        const books = response.data.items;
        bookService.listBooks(extra.id, (err, savedBooks) => {
            if (err) {
                console.log(err);
                return res.status(500).send('An error occurred while fetching saved books');
            }
            const savedBookTitles = savedBooks.map(book => book.titulo);
            res.render('index', { data: books, user: extra, message: message, subject: subject, savedBookTitles });
        });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('An error occurred while fetching books');
    });
}

module.exports = renderMainPage;