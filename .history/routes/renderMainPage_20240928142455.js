require('dotenv').config();
const axios = require('axios');

const key = process.env.GOOGLE_BOOKS_API_KEY;

function renderMainPage(req, res, extra, message, bookQuery = req.session.lastSearch, subject) { 
    // Defina valores padrão se bookQuery ou subject não estiverem definidos
    bookQuery = bookQuery || 'javascript';
    subject = subject || '';

    // Construa a URL da requisição
    let url = `https://www.googleapis.com/books/v1/volumes?q=${bookQuery}&key=${key}`;
    if (subject) {
        url += `&subject=${subject}`;
    }

    console.log(url)

    axios.get(url)
    .then((response) => {
        res.render('index', { data: response.data.items, user: extra, message: message });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('An error occurred while fetching books');
    });
}

module.exports = renderMainPage;