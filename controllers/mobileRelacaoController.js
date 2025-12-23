// controllers/mobileRelacaoController.js
const Parente = require('../models/Parente');
const Relacao = require('../models/Relacao');
const crypto = require('crypto');

/**
 * GET /api/mobile/relacoes/todas
 * Header obrigatório: X-Android-Id
 * Header opcional: If-None-Match (ETag)
 */
const todasLocalizacoesMobile = async (req, res) => {
  try {
    const androidId = req.header('X-Android-Id');

    if (!androidId) {
      return res.status(400).json({ message: 'Android ID não informado' });
    }

    // 1) Descobre quem é esse device e a qual usuário ele pertence
    const parente = await Parente.findByAndroidId(androidId);

    if (!parente) {
      return res.status(404).json({ message: 'Dispositivo não vinculado' });
    }

    const id_usr = parente.id_usr;

    // 2) ETag (baseado na última atualização do usuário)
    const lastUpdate = await Relacao.maxCapturadoEmPorUsuario(id_usr);
    const etagRaw = `${id_usr}:${lastUpdate ? new Date(lastUpdate).getTime() : 0}`;
    const etag = crypto.createHash('sha1').update(etagRaw).digest('hex');

    const ifNoneMatch = req.header('If-None-Match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      // Nada mudou → sem payload
      return res.status(304).end();
    }

    // 3) Pega todas as últimas localizações do usuário (JOIN)
    const rows = await Relacao.ultimasPorUsuario(id_usr, androidId);

    res.setHeader('ETag', etag);
    return res.json({ data: rows });
  } catch (error) {
    console.error('❌ Mobile todas localizações:', error);
    return res.status(500).json({ message: 'Erro interno' });
  }
};

module.exports = {
  todasLocalizacoesMobile
};


// // controllers/mobileRelacaoController.js
// const Parente = require('../models/Parente');
// const Relacao = require('../models/Relacao');

// /**
//  * GET /api/mobile/relacoes/ultima
//  * Header: X-Android-Id
//  */
// const ultimaLocalizacaoMobile = async (req, res) => {
//   try {
//     const androidId = req.header('X-Android-Id');

//     if (!androidId) {
//       return res.status(400).json({
//         message: 'Android ID não informado'
//       });
//     }

//     // 🔎 Busca parente pelo android_id
//     const parente = await Parente.findByAndroidId(androidId);

//     if (!parente) {
//       return res.status(404).json({
//         message: 'Dispositivo não vinculado'
//       });
//     }

//     // 🔁 REUTILIZA LÓGICA EXISTENTE
//     const localizacao = await Relacao.ultimaPorParente(parente.id_par);

//     if (!localizacao) {
//       return res.status(404).json({
//         message: 'Nenhuma localização encontrada'
//       });
//     }

//     return res.json({
//       data: localizacao
//     });

//   } catch (error) {
//     console.error('❌ Mobile ultima localização:', error);
//     return res.status(500).json({
//       message: 'Erro interno'
//     });
//   }
// };

// module.exports = {
//   ultimaLocalizacaoMobile
// };
