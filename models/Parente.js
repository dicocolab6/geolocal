// models/Parente.js 
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Parente {
  // Criar novo parente
  static async create(parenteData) {
  const { nome, email, senha, id_usr, android_id } = parenteData;
  const hashedPassword = await bcrypt.hash(senha, 10);

  const query = `
    INSERT INTO parentes (nome, email, senha, criado_em, id_usr, android_id)
    VALUES ($1, $2, $3, NOW(), $4, $5)
    RETURNING id_par, nome, email, criado_em, id_usr, android_id
  `;

  try {
    const result = await db.query(query, [
      nome,
      email,
      hashedPassword,
      id_usr,
      android_id || null
    ]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Este Android ID já está vinculado a outro parente');
    }
    throw new Error('Erro ao criar parente: ' + error.message);
  }
}

  // Buscar parentes por usuário (dono)
  static async findByUserId(id_usr) {
    const query = `
      SELECT id_par, nome, email, criado_em, android_id FROM parentes
      WHERE id_usr = $1 ORDER BY nome`
    try {
      const result = await db.query(query, [id_usr]);
      return result.rows;
    } catch (error) {
      throw new Error('Erro ao buscar parentes: ' + error.message);
    }
  }

  // Buscar parente por email (para futuros logins, se quiser)
  static async findByEmail(email) {
    const query = 'SELECT * FROM parentes WHERE email = $1';
    try {
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Erro ao buscar parente por email: ' + error.message);
    }
  }

  // Buscar parente por Android ID
  static async findByAndroidId(android_id) {
    const query = `
      SELECT p.id_par, p.id_usr
      FROM parentes p
      WHERE p.android_id = $1
    `;
    const result = await db.query(query, [android_id]);
    return result.rows[0] || null;
  }

  // Vincular Android ID ao parente
  static async updateAndroidId(id_par, android_id) {
    const query = `
    UPDATE parentes
    SET android_id = $1
    WHERE id_par = $2
    RETURNING id_par, android_id
  `;
    try {
      const result = await db.query(query, [android_id, id_par]);
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Este dispositivo já está vinculado a outro parente');
      }
      throw new Error('Erro ao salvar android_id: ' + error.message);
    }
  }

  // Atualizar parente
  static async update(id_par, parenteData) {
  const { nome, email, android_id } = parenteData;

  const query = `
    UPDATE parentes
    SET nome = $1,
        email = $2,
        android_id = $3
    WHERE id_par = $4
    RETURNING id_par, nome, email, android_id
  `;

  try {
    const result = await db.query(query, [
      nome,
      email,
      android_id || null,
      id_par
    ]);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Este Android ID já está vinculado a outro parente');
    }
    throw new Error('Erro ao atualizar parente: ' + error.message);
  }
}

  // Deletar parente
  static async delete(id_par) {
    const query = 'DELETE FROM parentes WHERE id_par = $1';
    try {
      const result = await db.query(query, [id_par]);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error('Erro ao deletar parente: ' + error.message);
    }
  }

  // Validar senha do parente (caso queira autenticação de parente)
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Parente;
