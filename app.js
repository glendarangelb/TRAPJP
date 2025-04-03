const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Página inicial
app.get('/', (req, res) => res.render('index'));

// Criar banco de dados
app.get('/criar-db', (req, res) => res.render('criar_db'));
app.post('/criar-db', (req, res) => {
  const { nome_db } = req.body;
  connection.query(`CREATE DATABASE ${nome_db}`, (err) => {
    if (err) return res.send('Erro ao criar banco de dados: ' + err.message);
    res.redirect('/sucesso');
  });
});

// Criar tabela
app.get('/criar-tabela', (req, res) => res.render('criar_tabela'));
app.post('/criar-tabela', (req, res) => {
  const { db, tabela, campo1, tipo1, campo2, tipo2, campo3, tipo3 } = req.body;

  const createQuery = `
    CREATE TABLE IF NOT EXISTS ${tabela} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ${campo1} ${tipo1},
      ${campo2 || 'campo2'} ${tipo2 || 'VARCHAR(100)'},
      ${campo3 || 'campo3'} ${tipo3 || 'VARCHAR(100)'}
    )
  `;

  connection.query(`USE ${db}`, (err) => {
    if (err) return res.send('Erro ao selecionar banco: ' + err.message);
    connection.query(createQuery, (err) => {
      if (err) return res.send('Erro ao criar tabela: ' + err.message);
      res.redirect('/sucesso');
    });
  });
});

// Página para inserir dados (exibe formulário)
app.get('/inserir', (req, res) => {
  res.render('inserir', { campos: null, db: '', tabela: '' });
});

// Carregar campos da tabela dinamicamente
app.post('/carregar-campos', (req, res) => {
  const { db, tabela } = req.body;

  connection.query(`USE ${db}`, (err) => {
    if (err) return res.send('Erro ao selecionar banco: ' + err.message);

    const sql = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME != 'id'
    `;
    connection.query(sql, [db, tabela], (err, results) => {
      if (err) return res.send('Erro ao obter colunas: ' + err.message);
      const campos = results.map(r => r.COLUMN_NAME);
      res.render('inserir', { campos, db, tabela });
    });
  });
});

// Inserir os dados no banco
app.post('/inserir-dados', (req, res) => {
  const { db, tabela } = req.body;
  const dados = { ...req.body };
  delete dados.db;
  delete dados.tabela;

  const colunas = Object.keys(dados);
  const valores = Object.values(dados);

  connection.query(`USE ${db}`, (err) => {
    if (err) return res.send('Erro ao selecionar banco: ' + err.message);

    const sql = `INSERT INTO ${tabela} (${colunas.join(',')}) VALUES (${colunas.map(() => '?').join(',')})`;
    connection.query(sql, valores, (err) => {
      if (err) return res.send('Erro ao inserir dados: ' + err.message);
      res.redirect('/sucesso');
    });
  });
});

// Listar dados da tabela
app.get('/listar', (req, res) => {
  res.render('listar', { registros: [] });
});

app.post('/listar', (req, res) => {
  const { db, tabela } = req.body;

  connection.query(`USE ${db}`, (err) => {
    if (err) return res.send('Erro ao selecionar banco: ' + err.message);

    const sql = `SELECT * FROM ${tabela}`;
    connection.query(sql, (err, results) => {
      if (err) return res.send('Erro ao listar dados: ' + err.message);
      res.render('listar', { registros: results });
    });
  });
});

// Página de sucesso
app.get('/sucesso', (req, res) => {
  res.render('sucesso');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
