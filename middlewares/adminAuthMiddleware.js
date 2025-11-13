// middlewares/adminAuthMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function adminAuthMiddleware(req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ message: 'Token admin ausente' });
  const [bearer, token] = hdr.split(' ');
  if (bearer !== 'Bearer' || !token) return res.status(401).json({ message: 'Formato inválido de Authorization' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Acesso restrito' });
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token admin inválido/expirado' });
  }
}
module.exports = adminAuthMiddleware;
