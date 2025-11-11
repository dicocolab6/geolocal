// models/Relacao.js
const db = require('../config/database');

class Relacao {
  // Inserir nova localização de parente
  static async create({ id_par, id_usr, coord_x, coord_y }) {
    const query = `
      INSERT INTO relacoes (id_par, id_usr, coord_x, coord_y)
      VALUES ($1, $2, $3, $4)
      RETURNING id_rel, id_par, id_usr, coord_x, coord_y, capturado_em
    `;
    try {
      const result = await db.query(query, [id_par, id_usr, coord_x, coord_y]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Erro ao registrar localização do parente: ' + error.message);
    }
  }
  // Buscar última localização de um parente
  static async ultimaPorParente(id_par) {
    const query = `
      SELECT * FROM relacoes
      WHERE id_par = $1
      ORDER BY capturado_em DESC
      LIMIT 1
    `;
    try {
      const result = await db.query(query, [id_par]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Erro ao buscar última localização: ' + error.message);
    }
  }
}
module.exports = Relacao;
