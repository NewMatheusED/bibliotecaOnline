# Projeto de Biblioteca Online

Este projeto é uma aplicação web que permite aos usuários pesquisar livros usando a API Google Books e armazenar livros de interesse em uma base de dados local.

## Funcionalidades

- **Cadastro de usuários**: Os usuários podem criar uma nova conta fornecendo um nome de usuário, email e senha.
- **Login de usuários**: Os usuários podem fazer login na aplicação com o email e senha que forneceram durante o cadastro.
- **Pesquisa de livros**: Os usuários podem pesquisar livros por título, autor ou outros termos de pesquisa. Os resultados da pesquisa são exibidos na página inicial.
- **Armazenamento de livros**: Os usuários podem escolher livros dos resultados da pesquisa para guardar em uma base de dados local. Os livros guardados podem ser visualizados em uma página separada.
- **Redirecionamento para a página inicial**: A partir da página de livros guardados, os usuários podem voltar para a página inicial para realizar uma nova pesquisa.

## Tecnologias Utilizadas

- Node.js e Express.js para o backend
- EJS para a visualização de templates
- MySQL para a base de dados
- Axios para fazer requisições à API Google Books

## Configuração

Para executar este projeto localmente, você precisará criar um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```properties
GOOGLE_BOOKS_API_KEY=sua_chave_da_api
DB_HOST=localhost
DB_USER=seu_usuario_do_banco_de_dados
DB_PASSWORD=sua_senha_do_banco_de_dados
DB_NAME=nome_do_seu_banco_de_dados
```

## Como Executar o Projeto

1. Clone o repositório para a sua máquina local.
2. Navegue até a pasta do projeto e execute `npm install` para instalar as dependências.
3. Execute `node setup.js` para criar a tabela utilizada no projeto.
4. Execute `nodemon index.js` para iniciar o servidor. Caso apresente erro, refaça a instalação do nodemon com o comando `npm install nodemon`, caso persista, execute `node index.js`.
5. Abra um navegador e vá para `http://localhost:3000` para ver a aplicação em funcionamento.