// models/Parente.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Parente {
  // Criar novo parente
  static async create(parenteData) {
    const { nome, email, senha, id_usr } = parenteData;
    const hashedPassword = await bcrypt.hash(senha, 10);
    const query = `
      INSERT INTO parentes (nome, email, senha, criado_em, id_usr)
      VALUES ($1, $2, $3, NOW(), $4)
      RETURNING id_par, nome, email, criado_em, id_usr
    `;
    try {
      const result = await db.query(query, [nome, email, hashedPassword, id_usr]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email já está em uso');
      }
      throw new Error('Erro ao criar parente: ' + error.message);
    }
  }

  // Buscar parentes por usuário (dono)
  static async findByUserId(id_usr) {
    const query = `
      SELECT id_par, nome, email, criado_em FROM parentes
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

  // Atualizar parente
  static async update(id_par, parenteData) {
    const { nome, email } = parenteData;
    const query = `UPDATE parentes SET nome = $1, email = $2 WHERE id_par = $3
      RETURNING id_par, nome, email`;
    try {
      const result = await db.query(query, [nome, email, id_par]);
      if (result.rowCount === 0) return null;
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email já está em uso');
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
