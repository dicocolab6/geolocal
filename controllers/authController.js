const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthController {
  // POST /api/auth/login - Fazer login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validação básica
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }
      
      // Buscar usuário por email
      const user = await User.findByEmail(email);
      console.log('[DEBUG AuthController] Usuário encontrado:', user);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }
      
      // Validar senha
      const isPasswordValid = await User.validatePassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }
      
      // Gerar token JWT
      const jwtPayload = {
        id: user.id, 
        email: user.email,
        name: user.name
      };
      console.log('[DEBUG AuthController] Payload para JWT:', jwtPayload);
      const token = jwt.sign(
        jwtPayload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      console.log('[DEBUG AuthController] Token JWT criado:', token);
      
      // Usuário retornado ao front-end
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      console.log('[DEBUG AuthController] Usuário retornado para o front-end:', userResponse);
      
      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        token: token,
        user: userResponse
      });
      
    } catch (error) {
      console.error('[ERROR AuthController login]', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/auth/register - Registrar novo usuário
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      // Validação básica
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios'
        });
      }
      
      // Verificar se email já existe
      const existingUser = await User.findByEmail(email);
      console.log('[DEBUG AuthController] Usuário existente:', existingUser);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
      
      // Criar usuário
      const newUser = await User.create({ name, email, password });
      console.log('[DEBUG AuthController] Novo usuário criado:', newUser);
      
      // Gerar token automaticamente após registro
      const jwtPayload = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      };
      console.log('[DEBUG AuthController] Payload para JWT register:', jwtPayload);
      const token = jwt.sign(
        jwtPayload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      console.log('[DEBUG AuthController] Token JWT criado após registro:', token);
      
      // Usuário retornado ao front-end
      const userResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };
      console.log('[DEBUG AuthController] Usuário retornado para front-end após registro:', userResponse);
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        token: token,
        user: userResponse
      });
      
    } catch (error) {
      console.error('[ERROR AuthController register]', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/auth/me - Obter dados do usuário logado
  static async getMe(req, res) {
    try {
      // req.user vem do authMiddleware
      console.log('[DEBUG AuthController] req.user no /me:', req.user);
      const user = await User.findById(req.user.id);
      console.log('[DEBUG AuthController] User retornado em /me:', user);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
      
    } catch (error) {
      console.error('[ERROR AuthController getMe]', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;


// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// class AuthController {
  
//   // POST /api/auth/login - Fazer login
//   static async login(req, res) {
//     try {
//       const { email, password } = req.body;
      
//       // Validação básica
//       if (!email || !password) {
//         return res.status(400).json({
//           success: false,
//           message: 'Email e senha são obrigatórios'
//         });
//       }
      
//       // Buscar usuário por email
//       const user = await User.findByEmail(email);
//       console.log('[DEBUG AuthController] Usuário encontrado para login:', user);
      
//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Email ou senha incorretos'
//         });
//       }
      
//       // Validar senha
//       const isPasswordValid = await User.validatePassword(password, user.password);
      
//       if (!isPasswordValid) {
//         return res.status(401).json({
//           success: false,
//           message: 'Email ou senha incorretos'
//         });
//       }
      
//       // Gerar token JWT
//       const token = jwt.sign(
//         { 
//           id: user.id, 
//           email: user.email,
//           name: user.name
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//       );
      
//       res.status(200).json({
//         success: true,
//         message: 'Login realizado com sucesso',
//         token: token,
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email
//         }
//       });
      
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
  
//   // POST /api/auth/register - Registrar novo usuário (alternativa)
//   static async register(req, res) {
//     try {
//       const { name, email, password } = req.body;
      
//       // Validação básica
//       if (!name || !email || !password) {
//         return res.status(400).json({
//           success: false,
//           message: 'Todos os campos são obrigatórios'
//         });
//       }
      
//       // Verificar se email já existe
//       const existingUser = await User.findByEmail(email);
//       if (existingUser) {
//         return res.status(409).json({
//           success: false,
//           message: 'Email já está em uso'
//         });
//       }
      
//       // Criar usuário
//       const newUser = await User.create({ name, email, password });
      
//       // Gerar token automaticamente após registro
//       const token = jwt.sign(
//         { 
//           id: newUser.id, 
//           email: newUser.email,
//           name: newUser.name
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//       );
      
//       res.status(201).json({
//         success: true,
//         message: 'Usuário criado com sucesso',
//         token: token,
//         user: {
//           id: newUser.id,
//           name: newUser.name,
//           email: newUser.email
//         }
//       });
      
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
  
//   // GET /api/auth/me - Obter dados do usuário logado
//   static async getMe(req, res) {
//     try {
//       // req.user vem do authMiddleware
//       const user = await User.findById(req.user.id);
      
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: 'Usuário não encontrado'
//         });
//       }
      
//       res.status(200).json({
//         success: true,
//         data: user
//       });
      
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
// }

// module.exports = AuthController;
