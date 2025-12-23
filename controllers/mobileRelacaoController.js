const Parente = require('../models/Parente');
const Relacao = require('../models/Relacao');

/**
 * GET /api/mobile/relacoes/ultima
 * Header: X-Android-Id
 */
const ultimaLocalizacaoMobile = async (req, res) => {
  try {
    const androidId = req.header('X-Android-Id');

    if (!androidId) {
      return res.status(400).json({
        message: 'Android ID não informado'
      });
    }

    // 🔎 Busca parente pelo android_id
    const parente = await Parente.findByAndroidId(androidId);

    if (!parente) {
      return res.status(404).json({
        message: 'Dispositivo não vinculado'
      });
    }

    // 🔁 REUTILIZA LÓGICA EXISTENTE
    const localizacao = await Relacao.ultimaPorParente(parente.id_par);

    if (!localizacao) {
      return res.status(404).json({
        message: 'Nenhuma localização encontrada'
      });
    }

    return res.json({
      data: localizacao
    });

  } catch (error) {
    console.error('❌ Mobile ultima localização:', error);
    return res.status(500).json({
      message: 'Erro interno'
    });
  }
};

module.exports = {
  ultimaLocalizacaoMobile
};
