const router = require('express').Router();
const adminAuth = require('../middlewares/adminAuthMiddleware');
const db = require('../config/database');

router.get('/parentes-coordenadas', adminAuth, async (req, res) => {
  try {
    const sql = `
      SELECT p.id_par, p.nome, p.id_usr, r.coord_x, r.coord_y, r.capturado_em
      FROM parentes p
      JOIN LATERAL (
        SELECT coord_x, coord_y, capturado_em
        FROM relacoes r
        WHERE r.id_par = p.id_par
        ORDER BY capturado_em DESC
        LIMIT 1
      ) r ON true
      ORDER BY p.nome;
    `;
    const { rows } = await db.query(sql);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
