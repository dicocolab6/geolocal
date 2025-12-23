// controllers/webhookLocalizacaoController.js
const Parente = require('../models/Parente');
const Relacao = require('../models/Relacao');
const { validateHmacForDevice, generateHmacForDevice } = require('../utils/hmac');

const receberLocalizacao = async (req, res) => {
  try {
    const signature = req.header('X-Signature');
    const timestamp = req.header('X-Timestamp');
    const rawBody = req.rawBody;

    console.log('📩 Webhook recebido:', rawBody);
    console.log('📦 Timestamp:', timestamp);

    if (!signature || !timestamp) {
      console.warn('❌ Assinatura/timestamp ausente');
      return res.status(401).json({ message: 'Assinatura/timestamp ausente' });
    }

    const { android_id, latitude, longitude } = req.body;

    if (!android_id || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    // assina exatamente igual ao app
    const textToSign = `${timestamp}.${rawBody}`;

    console.log('HMAC ESPERADO:', generateHmacForDevice(android_id, textToSign));
    console.log('HMAC RECEBIDO:', signature);

    if (!validateHmacForDevice(android_id, textToSign, signature)) {
      console.warn('❌ HMAC inválido');
      return res.status(401).json({ message: 'Assinatura inválida' });
    }

    const parente = await Parente.findByAndroidId(android_id);
    if (!parente) {
      console.warn(`⚠️ Android ID não vinculado: ${android_id}`);
      return res.status(404).json({ message: 'Dispositivo não vinculado' });
    }

    await Relacao.create({
      id_par: parente.id_par,
      id_usr: parente.id_usr,
      coord_x: latitude,
      coord_y: longitude
    });

    console.log(`✅ Localização salva | parente=${parente.id_par}`);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('❌ Erro no webhook:', err);
    return res.status(500).json({ message: 'Erro interno' });
  }
};

module.exports = { receberLocalizacao };


// // controllers/webhookLocalizacaoController.js
// const Parente = require('../models/Parente');
// const Relacao = require('../models/Relacao');
// const { validateHmac, generateHmac } = require('../utils/hmac');

// const receberLocalizacao = async (req, res) => {
//   const signature = req.header('X-Signature');
//   const timestamp = req.header('X-Timestamp');
//   const rawBody = req.rawBody;

//   console.log('📩 Webhook recebido:', rawBody);
//   console.log('📦 Timestamp:', timestamp);

//   if (!signature || !timestamp) {
//     console.warn('❌ Assinatura ou timestamp ausente');
//     return res.status(401).json({ message: 'Assinatura inválida' });
//   }

//   // 🔐 PAYLOAD EXATAMENTE IGUAL AO ANDROID
//   const signaturePayload = `${timestamp}.${rawBody}`;

//   console.log('HMAC ESPERADO:', generateHmac(signaturePayload));
//   console.log('HMAC RECEBIDO:', signature);

//   if (!validateHmac(signaturePayload, signature)) {
//     console.warn('❌ HMAC inválido');
//     return res.status(401).json({ message: 'Assinatura inválida' });
//   }

//   const { android_id, latitude, longitude } = req.body;

//   if (!android_id || !latitude || !longitude) {
//     return res.status(400).json({ message: 'Dados incompletos' });
//   }

//   const parente = await Parente.findByAndroidId(android_id);

//   if (!parente) {
//     console.warn(`⚠️ Android ID não vinculado: ${android_id}`);
//     return res.status(404).json({ message: 'Dispositivo não vinculado' });
//   }

//   await Relacao.create({
//     id_par: parente.id_par,
//     id_usr: parente.id_usr,
//     coord_x: latitude,
//     coord_y: longitude
//   });

//   console.log(`✅ Localização salva | parente=${parente.id_par}`);
//   return res.status(201).json({ success: true });
// };

// module.exports = { receberLocalizacao };
