const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    // LOG: Ver o header completo
    console.log('📥 Headers recebidos:', req.headers);
    
    // Pegar token do header
    const authHeader = req.headers.authorization;
    console.log('🔑 Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log('❌ Token não fornecido');
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }
    
    const token = authHeader.split(' ')[1]; // "Bearer TOKEN"
    console.log('🔑 Token extraído:', token);
    
    if (!token) {
      console.log('❌ Token vazio após split');
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }
    
    // Verificar token
    console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'NÃO DEFINIDO');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido! Usuário:', decoded);
    
    // Adicionar dados do usuário na requisição
    req.user = decoded;
    
    next(); // Continuar para a próxima função
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
      error: error.message
    });
  }
};

module.exports = authMiddleware;