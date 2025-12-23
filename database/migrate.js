const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  console.log('📦 Verificando migrations...');

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const file of files) {
    const alreadyRan = await pool.query(
      'SELECT 1 FROM migrations WHERE filename = $1',
      [file]
    );

    if (alreadyRan.rowCount > 0) {
      console.log(`⏭️  ${file} (já executada)`);
      continue;
    }

    console.log(`▶️  Executando ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    await pool.query(sql);
    await pool.query(
      'INSERT INTO migrations (filename) VALUES ($1)',
      [file]
    );

    console.log(`✅ ${file} executada com sucesso`);
  }

  console.log('🚀 Migrations finalizadas');
}

module.exports = runMigrations;
