const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('node:path');

//Carregar variáveis de ambiente (SEMPRE NO TOPO!)
dotenv.config();

//Importar rotas
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const parenteRoutes = require('./routes/parenteRoutes');
const parenteAuthRoutes = require('./routes/parenteAuthRoutes');
const relacaoRoutes = require('./routes/relacaoRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminMapaRoutes = require('./routes/adminMapaRoutes');


//Importar middlewares
const errorMiddleware = require('./middlewares/errorMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');
const adminAuthMiddleware = require('./middlewares/adminAuthMiddleware');


//Inicializar Express
const app = express();

//=========================================
//          MIDDLEWARES GLOBAIS
//=========================================

//Segurança HTTP headers
//app.use(helmet());
// Helmet com segurança máxima
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://unpkg.com"],    // Permite scripts do Leaflet CDN
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"], // Permite CSS do Leaflet
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'"],           // ✅ Apenas scripts externos
//         scriptSrcAttr: ["'none'"],       // ✅ BLOQUEIA onclick
//         styleSrc: ["'self'", "'unsafe-inline'"], // CSS inline ainda permitido
//         imgSrc: ["'self'", "data:", "https:"],
//         connectSrc: ["'self'"],
//         fontSrc: ["'self'", "data:"],
//         objectSrc: ["'none'"],
//         mediaSrc: ["'self'"],
//         frameSrc: ["'none'"],
//       },
//     },
//     crossOriginEmbedderPolicy: false,
//   })
// );

// CORS - Permitir requisições do frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Parser de JSON
app.use(express.json());

//Parser de URL encoded (formulários)
app.use(express.urlencoded({ extended: true}));

//Servir arquivos estátivos (CSS, JS, iamgens)
app.use(express.static(path.join(__dirname, 'public')));

//Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

//======================================
//                 ROTAS
//======================================

//Rota raiz (página inicial)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Adicione estas rotas no app.js, antes das rotas da API

// Servir páginas HTML
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/parente-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'parente-login.html'));
});

app.get('/captura-localizacao.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'captura-localizacao.html'));
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

app.get('/dashboard_admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard_admin.html'));
});


//Rotas da API

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/parentes', authMiddleware, parenteRoutes);
app.use('/api/parente-auth', parenteAuthRoutes);
app.use('/api/relacoes', relacaoRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/admin', adminMapaRoutes);

// Rota 404 - Não encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota inexistente!'
    });
});

//===========================================
// MIDDLEWARE DE ERRO (SEMPRE POR ÚLTIMO)
//===========================================

app.use(errorMiddleware);

//===========================================
//            INICIAR SERVIDOR
//============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
        ======================================================
        🚀 Servidor rodando!
        🚦 Ambiente: ${process.env.NODE_ENV || 'development'}
        🌍 URL: http://localhost:${PORT}
        ======================================================
    `);
});

//Tratamento de erros não capturados
process.on('unhandleRejection', (err) => {
    console.error('❌ Erro não tartado: ', err);
    process.exit(1);
});


//ultima versão funcionando antes da página admin
// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const helmet = require('helmet');
// const path = require('node:path');

// //Carregar variáveis de ambiente (SEMPRE NO TOPO!)
// dotenv.config();

// //Importar rotas
// const userRoutes = require('./routes/userRoutes');
// const authRoutes = require('./routes/authRoutes');
// const parenteRoutes = require('./routes/parenteRoutes');
// const parenteAuthRoutes = require('./routes/parenteAuthRoutes');
// const relacaoRoutes = require('./routes/relacaoRoutes');

// //Importar middlewares
// const errorMiddleware = require('./middlewares/errorMiddleware');
// const authMiddleware = require('./middlewares/authMiddleware');

// //Inicializar Express
// const app = express();

// //=========================================
// //          MIDDLEWARES GLOBAIS
// //=========================================

// //Segurança HTTP headers
// //app.use(helmet());
// // Helmet com segurança máxima
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "https://unpkg.com"],    // Permite scripts do Leaflet CDN
//         styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"], // Permite CSS do Leaflet
//         imgSrc: ["'self'", "data:", "https:"],
//         connectSrc: ["'self'"],
//         fontSrc: ["'self'", "data:"],
//         objectSrc: ["'none'"],
//         mediaSrc: ["'self'"],
//         frameSrc: ["'none'"],
//       },
//     },
//     crossOriginEmbedderPolicy: false,
//   })
// );

// // app.use(
// //   helmet({
// //     contentSecurityPolicy: {
// //       directives: {
// //         defaultSrc: ["'self'"],
// //         scriptSrc: ["'self'"],           // ✅ Apenas scripts externos
// //         scriptSrcAttr: ["'none'"],       // ✅ BLOQUEIA onclick
// //         styleSrc: ["'self'", "'unsafe-inline'"], // CSS inline ainda permitido
// //         imgSrc: ["'self'", "data:", "https:"],
// //         connectSrc: ["'self'"],
// //         fontSrc: ["'self'", "data:"],
// //         objectSrc: ["'none'"],
// //         mediaSrc: ["'self'"],
// //         frameSrc: ["'none'"],
// //       },
// //     },
// //     crossOriginEmbedderPolicy: false,
// //   })
// // );

// // CORS - Permitir requisições do frontend
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true
// }));

// // Parser de JSON
// app.use(express.json());

// //Parser de URL encoded (formulários)
// app.use(express.urlencoded({ extended: true}));

// //Servir arquivos estátivos (CSS, JS, iamgens)
// app.use(express.static(path.join(__dirname, 'public')));

// //Log de requisições (desenvolvimento)
// if (process.env.NODE_ENV === 'development') {
//     app.use((req, res, next) => {
//         console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//         next();
//     });
// }

// //======================================
// //                 ROTAS
// //======================================

// //Rota raiz (página inicial)
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });

// // Adicione estas rotas no app.js, antes das rotas da API

// // Servir páginas HTML
// app.get('/index.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });

// app.get('/login.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'login.html'));
// });

// app.get('/dashboard.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
// });

// app.get('/parente-login.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'parente-login.html'));
// });

// app.get('/captura-localizacao.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'captura-localizacao.html'));
// });


// //Rotas da API

// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/parentes', authMiddleware, parenteRoutes);
// app.use('/api/parente-auth', parenteAuthRoutes);
// app.use('/api/relacoes', relacaoRoutes);

// // Rota 404 - Não encontrada
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: 'Rota inexistente!'
//     });
// });

// //===========================================
// // MIDDLEWARE DE ERRO (SEMPRE POR ÚLTIMO)
// //===========================================

// app.use(errorMiddleware);

// //===========================================
// //            INICIAR SERVIDOR
// //============================================

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     console.log(`
//         ======================================================
//         🚀 Servidor rodando!
//         🚦 Ambiente: ${process.env.NODE_ENV || 'development'}
//         🌍 URL: http://localhost:${PORT}
//         ======================================================
//     `);
// });

// //Tratamento de erros não capturados
// process.on('unhandleRejection', (err) => {
//     console.error('❌ Erro não tartado: ', err);
//     process.exit(1);
// });

