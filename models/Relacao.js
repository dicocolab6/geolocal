// models/Relacao.js
const db = require('../config/database');

class Relacao {
  // 🔥 ÚNICO método de criação de localização
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
      throw new Error('Erro ao registrar localização: ' + error.message);
    }
  }

  // Buscar última localização de um parente
  static async ultimaPorParente(id_par) {
    const query = `
      SELECT *
      FROM relacoes
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

  /**
   * ✅ MOBILE: pega TODAS as últimas localizações do usuário (id_usr),
   * retornando também nome do parente e um flag is_self (pai/este device).
   *
   * Retorno: [{ id_par, nome, coord_x, coord_y, capturado_em, is_self }]
   */
  static async ultimasPorUsuario(id_usr, androidIdRequester) {
    const query = `
      SELECT
        p.id_par,
        p.nome,
        r.coord_x,
        r.coord_y,
        r.capturado_em,
        (p.android_id = $2) AS is_self
      FROM parentes p
      JOIN LATERAL (
        SELECT coord_x, coord_y, capturado_em
        FROM relacoes
        WHERE id_par = p.id_par
        ORDER BY capturado_em DESC
        LIMIT 1
      ) r ON TRUE
      WHERE p.id_usr = $1
      ORDER BY p.nome
    `;

    const result = await db.query(query, [id_usr, androidIdRequester]);
    return result.rows;
  }

  /**
   * ✅ Para ETag: pega a última data de atualização do usuário
   */
  static async maxCapturadoEmPorUsuario(id_usr) {
    const query = `
      SELECT MAX(r.capturado_em) AS last_update
      FROM relacoes r
      JOIN parentes p ON p.id_par = r.id_par
      WHERE p.id_usr = $1
    `;
    const result = await db.query(query, [id_usr]);
    return result.rows[0]?.last_update || null;
  }
}

module.exports = Relacao;


// // models/Relacao.js
// const db = require('../config/database');

// class Relacao {

//   // 🔥 ÚNICO método de criação de localização
//   static async create({ id_par, id_usr, coord_x, coord_y }) {
//     const query = `
//       INSERT INTO relacoes (id_par, id_usr, coord_x, coord_y)
//       VALUES ($1, $2, $3, $4)
//       RETURNING id_rel, id_par, id_usr, coord_x, coord_y, capturado_em
//     `;

//     try {
//       const result = await db.query(query, [
//         id_par,
//         id_usr,
//         coord_x,
//         coord_y
//       ]);
//       return result.rows[0];
//     } catch (error) {
//       throw new Error('Erro ao registrar localização: ' + error.message);
//     }
//   }

//   // Buscar última localização de um parente
//   static async ultimaPorParente(id_par) {
//     const query = `
//       SELECT *
//       FROM relacoes
//       WHERE id_par = $1
//       ORDER BY capturado_em DESC
//       LIMIT 1
//     `;
//     try {
//       const result = await db.query(query, [id_par]);
//       return result.rows[0] || null;
//     } catch (error) {
//       throw new Error('Erro ao buscar última localização: ' + error.message);
//     }
//   }
// }

// module.exports = Relacao;


// // // models/Relacao.js 
// // const db = require('../config/database');

// // class Relacao {
  
// //   // Inserir nova localização de parente
// //   static async create({ id_par, id_usr, coord_x, coord_y }) {
// //     const query = `
// //       INSERT INTO relacoes (id_par, id_usr, coord_x, coord_y)
// //       VALUES ($1, $2, $3, $4)
// //       RETURNING id_rel, id_par, id_usr, coord_x, coord_y, capturado_em
// //     `;
// //     try {
// //       const result = await db.query(query, [id_par, id_usr, coord_x, coord_y]);
// //       return result.rows[0];
// //     } catch (error) {
// //       throw new Error('Erro ao registrar localização do parente: ' + error.message);
// //     }
// //   }

// //   // Inserir nova localização de parente a partir do dispositivo
// //   static async createFromDevice({ id_par, id_usr, coord_x, coord_y }) {
// //     const query = `
// //     INSERT INTO relacoes (id_par, id_usr, coord_x, coord_y)
// //     VALUES ($1, $2, $3, $4)
// //     RETURNING *
// //   `;
// //     const result = await db.query(query, [id_par, id_usr, coord_x, coord_y]);
// //     return result.rows[0];
// //   }

// //   // Buscar última localização de um parente
// //   static async ultimaPorParente(id_par) {
// //     const query = `
// //       SELECT * FROM relacoes
// //       WHERE id_par = $1
// //       ORDER BY capturado_em DESC
// //       LIMIT 1
// //     `;
// //     try {
// //       const result = await db.query(query, [id_par]);
// //       return result.rows[0] || null;
// //     } catch (error) {
// //       throw new Error('Erro ao buscar última localização: ' + error.message);
// //     }
// //   }
// // }
// // module.exports = Relacao;
