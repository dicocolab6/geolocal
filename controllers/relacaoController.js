const Relacao = require('../models/Relacao');
// POST /api/relacoes
const create = async (req, res) => {
  try {
    const { id_par, coord_x, coord_y } = req.body;
    const id_usr = req.user.id; // usuário autenticado pelo middleware
    if (!id_par || !coord_x || !coord_y || !id_usr) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }
    const relacao = await Relacao.create({ id_par, id_usr, coord_x, coord_y });
    res.status(201).json({ data: relacao });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET /api/relacoes/ultima/:id_par
const ultimaPorParente = async (req, res) => {
  try {
    const { id_par } = req.params;
    const localizacao = await Relacao.ultimaPorParente(id_par);
    if (!localizacao) return res.status(404).json({ message: 'Nenhuma localização encontrada.' });
    res.json({ data: localizacao });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { create, ultimaPorParente };
