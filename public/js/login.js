const API_URL = '/api';
const dashboardUrl = '/dashboard.html';

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    checkIfLoggedIn();
    setupEventListeners();
});

// ========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ========================================

function checkIfLoggedIn() {
    const token = localStorage.getItem('token');
    if (token) {
        globalThis.window.location.href = dashboardUrl;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    for (const btn of tabButtons) {
        btn.addEventListener('click', handleTabClick);
    }
    
    document.getElementById('form-login').addEventListener('submit', handleLogin);
    document.getElementById('form-register').addEventListener('submit', handleRegister);
}

// ========================================
// HANDLERS DE TABS
// ========================================

function handleTabClick(e) {
    const tab = e.target.dataset.tab;
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    for (const btn of tabButtons) {
        btn.classList.remove('active');
    }
    
    e.target.classList.add('active');
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
    
    hideMessage();
}

// ========================================
// FUNÇÕES AUXILIARES DE AUTENTICAÇÃO
// ========================================

function saveAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function redirectToDashboard(message) {
    showMessage(message, 'success');
    setTimeout(() => {
        globalThis.window.location.href = dashboardUrl;
    }, 1000);
}

function resetButton(btn, text) {
    btn.disabled = false;
    btn.textContent = text;
}

function handleAuthError(error, btn, originalText, logPrefix) {
    console.error(`${logPrefix}:`, error);
    showMessage('Erro ao conectar com o servidor', 'error');
    resetButton(btn, originalText);
}

// ========================================
// HANDLERS DE FORMULÁRIOS
// ========================================

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    const originalText = 'Entrar';
    
    btn.disabled = true;
    btn.textContent = 'Entrando...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            saveAuthData(data.token, data.user);
            redirectToDashboard('Login realizado com sucesso! Redirecionando...');
        } else {
            showMessage(data.message || 'Erro ao fazer login', 'error');
            resetButton(btn, originalText);
        }
    } catch (error) {
        handleAuthError(error, btn, originalText, 'Erro ao fazer login');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const btn = document.getElementById('register-btn');
    const originalText = 'Criar Conta';
    
    btn.disabled = true;
    btn.textContent = 'Criando conta...';
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            saveAuthData(data.token, data.user);
            redirectToDashboard('Conta criada com sucesso! Redirecionando...');
        } else {
            showMessage(data.message || 'Erro ao criar conta', 'error');
            resetButton(btn, originalText);
        }
    } catch (error) {
        handleAuthError(error, btn, originalText, 'Erro ao registrar');
    }
}

// ========================================
// FUNÇÕES DE MENSAGEM
// ========================================

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
}

function hideMessage() {
    const message = document.getElementById('message');
    message.style.display = 'none';
}
