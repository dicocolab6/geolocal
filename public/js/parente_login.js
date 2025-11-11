const API_URL = '/api';
const capturaCoordenadaUrl = '/captura-localizacao.html';

// =============================
// INICIALIZAÇÃO
// =============================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListenersParente();
});

function setupEventListenersParente() {
    document.getElementById('form-login-parente').addEventListener('submit', handleLoginParente);
}

async function handleLoginParente(e) {
    e.preventDefault();

    const email = document.getElementById('login-email-parente').value;
    const senha = document.getElementById('login-password-parente').value;
    const btn = document.getElementById('login-btn-parente');
    const originalText = 'Entrar';

    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        const response = await fetch(`${API_URL}/parente-auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await response.json();
        if (response.ok) {
            // Salva token e dados do parente
            localStorage.setItem('parente-token', data.token);
            localStorage.setItem('parente', JSON.stringify(data.parente));
            showMessageParente('Login realizado com sucesso! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = capturaCoordenadaUrl;
            }, 1000);
        } else {
            showMessageParente(data.message || 'Erro ao fazer login', 'error');
            resetButtonParente(btn, originalText);
        }
    } catch (error) {
        showMessageParente('Erro ao conectar com o servidor', 'error');
        resetButtonParente(btn, originalText);
    }
}

function resetButtonParente(btn, text) {
    btn.disabled = false;
    btn.textContent = text;
}

function showMessageParente(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
}
