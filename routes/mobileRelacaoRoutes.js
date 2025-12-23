const express = require('express');
const router = express.Router();
const controller = require('../controllers/mobileRelacaoController');

// MOBILE — sem authMiddleware
router.get('/relacoes/ultima', controller.ultimaLocalizacaoMobile);

module.exports = router;
