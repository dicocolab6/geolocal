// routes/mobileRelacaoRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/mobileRelacaoController');

// MOBILE — sem authMiddleware (valida por X-Android-Id)
router.get('/relacoes/todas', controller.todasLocalizacoesMobile);

module.exports = router;


// // routes/mobileRelacaoRoutes.js
// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/mobileRelacaoController');

// // MOBILE — sem authMiddleware
// router.get('/relacoes/ultima', controller.ultimaLocalizacaoMobile);

// module.exports = router;
