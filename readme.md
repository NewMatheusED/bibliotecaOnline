# Projeto de Biblioteca Online

Este projeto é uma aplicação web que permite aos usuários pesquisar livros usando a API Google Books e armazenar livros de interesse em uma base de dados local.

## Funcionalidades

- **Cadastro de usuários**: Os usuários podem criar uma nova conta fornecendo um nome de usuário, email e senha.
- **Login de usuários**: Os usuários podem fazer login na aplicação com o email e senha que forneceram durante o cadastro.
- **Pesquisa de livros**: Os usuários podem pesquisar livros por título, autor ou outros termos de pesquisa. Os resultados da pesquisa são exibidos na página inicial.
- **Armazenamento de livros**: Os usuários podem escolher livros dos resultados da pesquisa para guardar em uma base de dados local. Os livros guardados podem ser visualizados em uma página separada.
- **Redirecionamento para a página inicial**: A partir da página de livros guardados, os usuários podem voltar para a página inicial para realizar uma nova pesquisa.
- **Lembrar última pesquisa**: A aplicação agora lembra a última pesquisa realizada pelo usuário, mesmo após guardar um livro ou visitar a página de livros guardados.
- **Atualização de perfil**: Os usuários podem atualizar suas informações de perfil, incluindo a senha.
- **Deleção de usuários**: Os administradores podem deletar usuários da aplicação.
- **Deleção de livros**: Os usuários podem deletar livros que foram guardados na base de dados local.
- **Autenticação de usuários**: A aplicação utiliza autenticação para proteger rotas sensíveis.

## Tecnologias Utilizadas

- **Backend**: Node.js e Express.js
- **Template Engine**: EJS
- **Base de Dados**: Postgres
- **ORM**: Sequelize
- **Requisições HTTP**: Axios para fazer requisições à API Google Books
- **Autenticação**: Passport.js para autenticação local
- **Hash de Senha**: bcrypt.js para hash e verificação de senha
- **Gerenciamento de Sessão**: express-session para gerenciar sessões de usuário
- **Validação de Dados**: express-validator para validar e sanitizar dados de entrada
- **Segurança**: Helmet para configurar cabeçalhos HTTP relacionados à segurança
- **Upload de Arquivos**: Multer para upload de arquivos
- **Deploy**: Vercel para deploy da aplicação

## Configuração

Para executar este projeto localmente, você precisará criar um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```properties
GOOGLE_BOOKS_API_KEY='your_google_books_api_key'
SESSION_SECRET='your_session_secret'
PGHOST='your_postgresql_host'
PGDATABASE='your_postgresql_database'
PGUSER='your_postgresql_username'
PGPASSWORD='your_postgresql_password'
ENDPOINT_ID='your_endpoint_id'
PORT=3000
```

## Como Executar o Projeto

1. Clone o repositório para a sua máquina local.
2. Execute `npm run vercel-build` para configurar o projeto na sua máquina.
3. Execute `npm run dev` para iniciar o servidor.
4. Abra um navegador e vá para o link disponibilizado no console para ver a aplicação em funcionamento.