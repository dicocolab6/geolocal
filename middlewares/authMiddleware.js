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

    // "Bearer TOKEN"
    const parts = authHeader.split(' ');
    const scheme = parts[0];
    const token = parts[1];

    if (!/^Bearer$/i.test(scheme) || !token) {
      console.log('❌ Formato de Authorization inválido (esperado: Bearer TOKEN)');
      return res.status(401).json({
        success: false,
        message: 'Formato de autorização inválido'
      });
    }

    console.log('🔑 Token extraído:', token);
    console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'NÃO DEFINIDO');

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido! Payload:', payload);

    // Normalização:
    // - Login do usuário principal: payload.id -> req.user.id
    // - Login de parente: payload.id_usr -> req.user.id
    //   (mantém id_par e outros campos do payload, úteis no front/back)
    let normalizedUser = { ...payload };

    if (payload.id) {
      normalizedUser.id = payload.id; // já é o id do usuário dono
      console.log('👤 Token de usuário: req.user.id =', normalizedUser.id);
    } else if (payload.id_usr) {
      normalizedUser.id = payload.id_usr; // normaliza para o controller
      console.log('🧩 Token de parente: mapeando id_usr -> req.user.id =', normalizedUser.id);
    } else {
      console.log('❌ Payload não contém id ou id_usr');
      return res.status(401).json({
        success: false,
        message: 'Token inválido (sem id/id_usr)'
      });
    }

    // Anexa usuário normalizado
    req.user = normalizedUser;
    // LOG final
    console.log('📦 req.user final:', req.user);

    next();
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


//Funcionando porém sem trazer o id_usr para o login do parente
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const authMiddleware = (req, res, next) => {
//   try {
//     // LOG: Ver o header completo
//     console.log('📥 Headers recebidos:', req.headers);
    
//     // Pegar token do header
//     const authHeader = req.headers.authorization;
//     console.log('🔑 Authorization header:', authHeader);
    
//     if (!authHeader) {
//       console.log('❌ Token não fornecido');
//       return res.status(401).json({
//         success: false,
//         message: 'Token não fornecido'
//       });
//     }
    
//     const token = authHeader.split(' ')[1]; // "Bearer TOKEN"
//     console.log('🔑 Token extraído:', token);
    
//     if (!token) {
//       console.log('❌ Token vazio após split');
//       return res.status(401).json({
//         success: false,
//         message: 'Token não fornecido'
//       });
//     }
    
//     // Verificar token
//     console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'NÃO DEFINIDO');
    
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('✅ Token válido! Usuário:', decoded);
    
//     // Adicionar dados do usuário na requisição
//     req.user = decoded;
    
//     next(); // Continuar para a próxima função
//   } catch (error) {
//     console.error('❌ Erro ao verificar token:', error.message);
//     return res.status(401).json({
//       success: false,
//       message: 'Token inválido ou expirado',
//       error: error.message
//     });
//   }
// };


// module.exports = authMiddleware;
