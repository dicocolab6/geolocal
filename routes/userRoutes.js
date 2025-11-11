const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

//Rotas públicas
router.post('/register', UserController.createOne);

//Rotas protegidas
router.use(authMiddleware); //aplica middleware em todas as rotas abaixo

router.get('/', UserController.getAll);
router.get('/:id', UserController.getOne);
router.get('/:email', UserController.getEmail);
router.patch('/:id', UserController.updateOne);
router.delete('/:id', UserController.deleteOne);

module.exports = router;