const express = require('express');
const router = express.Router();
const ParenteController = require('../controllers/parenteController');
// Autenticação: adicione middleware caso necessário

router.post('/', ParenteController.create);      // POST /api/parentes
router.get('/', ParenteController.findAll);      // GET  /api/parentes
router.patch('/:id', ParenteController.update);  // PATCH /api/parentes/:id
router.delete('/:id', ParenteController.delete); // DELETE /api/parentes/:id

module.exports = router;
