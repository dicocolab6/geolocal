// routes/webhookLocalizacaoRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/webhookLocalizacaoController');

router.post('/localizacao', controller.receberLocalizacao);

module.exports = router;


// // routes/webhookLocalizacaoRoutes.js
// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/webhookLocalizacaoController');

// router.post('/localizacao', controller.receberLocalizacao);

// module.exports = router;
