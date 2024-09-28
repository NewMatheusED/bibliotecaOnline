require('dotenv').config();
const axios = require('axios');

const key = process.env.GOOGLE_BOOKS_API_KEY;

function renderMainPage(req, res, extra, message, bookQuery = req.session.lastSearch || 'javascript', b) { 
    axios.get(`https://www.googleapis.com/books/v1/volumes?q=${bookQuery}&key=${key}&subject=${subject}`)
    .then((response) => {
        res.render('index', { data: response.data.items, user: extra, message: message });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('An error occurred while fetching books');
    });
}

module.exports = renderMainPage;