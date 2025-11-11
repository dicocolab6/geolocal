const express = require('express');
const router = express.Router();
const ParenteAuthController = require('../controllers/parenteAuthController');

router.post('/login', ParenteAuthController.login);
module.exports = router;
