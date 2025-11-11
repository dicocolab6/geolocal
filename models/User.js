const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  
  // Criar novo usuário
  static async create(userData) {
    const { name, email, password } = userData;
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // PostgreSQL usa $1, $2, $3 ao invés de ?
    const query = `
      INSERT INTO users (name, email, password, created_at) 
      VALUES ($1, $2, $3, NOW())
      RETURNING id, name, email, created_at
    `;
    
    try {
      const result = await db.query(query, [name, email, hashedPassword]);
      return result.rows[0]; // PostgreSQL retorna em result.rows
    } catch (error) {
      if (error.code === '23505') { // Código de erro para unique violation no PostgreSQL
        throw new Error('Email já está em uso');
      }
      throw new Error('Erro ao criar usuário: ' + error.message);
    }
  }
  
  // Buscar todos os usuários
  static async findAll() {
    const query = 'SELECT id, name, email, created_at FROM users ORDER BY id';
    
    try {
      const result = await db.query(query);
      return result.rows; // PostgreSQL usa .rows
    } catch (error) {
      throw new Error('Erro ao buscar usuários: ' + error.message);
    }
  }
  
  // Buscar usuário por ID
  static async findById(id) {
    const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Erro ao buscar usuário: ' + error.message);
    }
  }
  
  // Buscar usuário por email (para login)
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Erro ao buscar usuário por email: ' + error.message);
    }
  }
  
  // Atualizar usuário
  static async update(id, userData) {
    const { name, email } = userData;
    const query = 'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at';
    
    try {
      const result = await db.query(query, [name, email, id]);
      
      if (result.rowCount === 0) { // PostgreSQL usa rowCount ao invés de affectedRows
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email já está em uso');
      }
      throw new Error('Erro ao atualizar usuário: ' + error.message);
    }
  }
  
  // Deletar usuário
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    
    try {
      const result = await db.query(query, [id]);
      return result.rowCount > 0; // PostgreSQL usa rowCount
    } catch (error) {
      throw new Error('Erro ao deletar usuário: ' + error.message);
    }
  }
  
  // Validar senha
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;