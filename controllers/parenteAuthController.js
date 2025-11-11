const Parente = require('../models/Parente');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class ParenteAuthController {
  static async login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha obrigatórios' });
    }
    const parente = await Parente.findByEmail(email);
    if (!parente) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }
    const valid = await Parente.validatePassword(senha, parente.senha);
    if (!valid) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }
    const token = jwt.sign(
      { id_par: parente.id_par, id_usr: parente.id_usr, nome: parente.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.status(200).json({
      message: 'Login de parente realizado com sucesso',
      token,
      parente: { id_par: parente.id_par, nome: parente.nome, id_usr: parente.id_usr }
    });
  }
}
module.exports = ParenteAuthController;
