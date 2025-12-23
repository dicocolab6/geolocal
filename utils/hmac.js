// utils/hmac.js
const crypto = require('crypto');

function baseSecret() {
  const s = process.env.WEBHOOK_HMAC_SECRET;
  if (!s) throw new Error('WEBHOOK_HMAC_SECRET ausente no .env');
  return s;
}

/**
 * ✅ mesma derivação do app:
 * perDeviceKey = HMAC_SHA256(baseSecret, android_id)
 */
function perDeviceKey(androidId) {
  return crypto
    .createHmac('sha256', baseSecret())
    .update(String(androidId), 'utf8')
    .digest(); // Buffer
}

/**
 * Assina texto (ex: "timestamp.payload") com a chave derivada do android_id
 */
function generateHmacForDevice(androidId, textToSign) {
  return crypto
    .createHmac('sha256', perDeviceKey(androidId))
    .update(textToSign, 'utf8')
    .digest('hex');
}

function validateHmacForDevice(androidId, textToSign, signatureHex) {
  const expected = generateHmacForDevice(androidId, textToSign);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHex, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

module.exports = {
  generateHmacForDevice,
  validateHmacForDevice
};


// // utils/hmac.js
// const crypto = require('crypto');

// function generateHmac(payload) {
//   return crypto
//     .createHmac('sha256', process.env.WEBHOOK_HMAC_SECRET)
//     .update(payload)
//     .digest('hex');
// }

// function validateHmac(payload, signature) {
//   const expected = generateHmac(payload);

//   try {
//     return crypto.timingSafeEqual(
//       Buffer.from(signature, 'hex'),
//       Buffer.from(expected, 'hex')
//     );
//   } catch {
//     return false;
//   }
// }

// module.exports = { generateHmac, validateHmac };
