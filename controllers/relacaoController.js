// controllers/relacaoController.js
const Relacao = require('../models/Relacao');

const create = async (req, res) => {
  try {
    console.log('[RELACOES][POST] user:', req.user);
    console.log('[RELACOES][POST] body:', req.body);

    const { id_par, coord_x, coord_y } = req.body;
    const id_usr = req.user?.id;
    if (!id_par || typeof coord_x !== 'number' || typeof coord_y !== 'number' || !id_usr) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }
    const relacao = await Relacao.create({ id_par, id_usr, coord_x, coord_y });
    console.log('[RELACOES][POST] created:', relacao);
    res.status(201).json({ data: relacao });
  } catch (error) {
    console.error('[RELACOES][POST] error:', error);
    res.status(500).json({ message: error.message });
  }
};

const ultimaPorParente = async (req, res) => {
  try {
    console.log('[RELACOES][GET] ultima for id_par:', req.params?.id_par, 'user:', req.user);
    const { id_par } = req.params;
    const localizacao = await Relacao.ultimaPorParente(id_par);
    console.log('[RELACOES][GET] ultima result:', localizacao);
    if (!localizacao) return res.status(404).json({ message: 'Nenhuma localização encontrada.' });
    res.json({ data: localizacao });
  } catch (error) {
    console.error('[RELACOES][GET] error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, ultimaPorParente };

//TESTANDO SALVAMENTO NO BANCO
// const Relacao = require('../models/Relacao');
// // POST /api/relacoes
// const create = async (req, res) => {
//   try {
//     const { id_par, coord_x, coord_y } = req.body;
//     const id_usr = req.user.id; // usuário autenticado pelo middleware
//     if (!id_par || !coord_x || !coord_y || !id_usr) {
//       return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
//     }
//     const relacao = await Relacao.create({ id_par, id_usr, coord_x, coord_y });
//     res.status(201).json({ data: relacao });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// // GET /api/relacoes/ultima/:id_par
// const ultimaPorParente = async (req, res) => {
//   try {
//     const { id_par } = req.params;
//     const localizacao = await Relacao.ultimaPorParente(id_par);
//     if (!localizacao) return res.status(404).json({ message: 'Nenhuma localização encontrada.' });
//     res.json({ data: localizacao });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// module.exports = { create, ultimaPorParente };

