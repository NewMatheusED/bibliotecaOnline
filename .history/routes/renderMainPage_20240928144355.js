require('dotenv').config();
const axios = require('axios');

const key = process.env.GOOGLE_BOOKS_API_KEY;
const searchDefault = ''

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
        query = 'javascript'; // Valor padrão se nenhum parâmetro for fornecido
    }
    
    let url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${key}`;

    console.log(url);

    axios.get(url)
    .then((response) => {
        res.render('index', { data: response.data.items, user: extra, message: message, subject: subject });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('An error occurred while fetching books');
    });
}

module.exports = renderMainPage;