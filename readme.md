# Projeto de Biblioteca Online

Este projeto é uma aplicação web que permite aos usuários pesquisar livros usando a API Google Books e armazenar livros de interesse em uma base de dados local.

## Funcionalidades

- **Pesquisa de livros**: Os usuários podem pesquisar livros por título, autor ou outros termos de pesquisa. Os resultados da pesquisa são exibidos na página inicial.
- **Armazenamento de livros**: Os usuários podem escolher livros dos resultados da pesquisa para guardar em uma base de dados local. Os livros guardados podem ser visualizados em uma página separada.
- **Redirecionamento para a página inicial**: A partir da página de livros guardados, os usuários podem voltar para a página inicial para realizar uma nova pesquisa.

## Tecnologias Utilizadas

- Node.js e Express.js para o backend
- EJS para a visualização de templates
- MySQL para a base de dados
- Axios para fazer requisições à API Google Books

## Como Executar o Projeto

1. Clone o repositório para a sua máquina local.
2. Navegue até a pasta do projeto e execute `npm install` para instalar as dependências.
3. Certifique-se de que você tem o MySQL instalado e configurado corretamente. Atualize o arquivo de conexão ( [db.js](db.js) e [setup.js](setup.js) ) do banco de dados com suas credenciais do MySQL.
4. Execute `node setup.js` para criar a tabela utilizada no projeto.
5. Execute `nodemon index.js` para iniciar o servidor. Caso apresente erro, refaça a instalação do nodemon com o comando `npm install nodemon`, caso persista, execute `node index.js`.
6. Abra um navegador e vá para `http://localhost:3000` para ver a aplicação em funcionamento.