const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');
const adminLogin = async (req, res) => {
  const { email, senha } = req.body;
  const admin = await AdminUser.findByEmail(email);
  if (!admin) return res.status(401).json({ message: 'Admin não encontrado.' });
  if (!await AdminUser.validatePassword(senha, admin.senha_hash)) return res.status(401).json({ message: 'Senha inválida.' });
  const token = jwt.sign({ id_admin: admin.id_admin, nome: admin.nome, email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ message: 'Login efetuado.', token, admin: { id_admin: admin.id_admin, nome: admin.nome, email: admin.email } });
};
module.exports = { adminLogin };
