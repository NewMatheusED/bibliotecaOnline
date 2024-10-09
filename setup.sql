CREATE TABLE IF NOT EXISTS livros_guardados (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    url_imagem VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    privilege VARCHAR(100) NOT NULL,
    profilepicture VARCHAR(255) NOT NULL
);