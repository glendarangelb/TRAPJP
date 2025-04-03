// bd.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'glenda', // Altere se tiver senha
  multipleStatements: true,
});

module.exports = connection; 