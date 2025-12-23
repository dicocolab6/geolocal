const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Testar conexão (opcional em PROD)
if (process.env.NODE_ENV !== 'production') {
  pool.connect((err, client, release) => {
    if (err) {
      console.log('❌ Erro ao conectar ao PostgreSQL:', err.message);
      process.exit(1);
    }
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    release();
  });
}

pool.on('error', (err) => {
  console.log('❌ Erro inesperado no PostgreSQL:', err);
  process.exit(1);
});

module.exports = pool;


// const { Pool } = require('pg'); 
// require('dotenv').config();

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT || 5432,
//     max: 10, // máximo de conexões no pool
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 2000
// });

// //Testar conexão
// pool.connect((err, client, release) => {
//     if (err) {
//         console.log('❌ Erro ao conectar ao postgreSQL: ', err.message);
//         process.exit(1);
//     }
//     console.log('✅ Conectado ao PostgreSQL com sucesso!');
//     release();
// });

// //Tratar erros do pool
// pool.on('error', (err) => {
//     console.log('❌ Erro inesperado no PostgreSQL: ', err);
//     process.exit(-1);
// });

// module.exports = pool;