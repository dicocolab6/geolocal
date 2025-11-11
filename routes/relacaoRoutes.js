const express = require('express');
const router = express.Router();
const relacaoController = require('../controllers/relacaoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, relacaoController.create);
router.get('/ultima/:id_par', authMiddleware, relacaoController.ultimaPorParente);
module.exports = router;
