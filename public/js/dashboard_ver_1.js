const API_URL = '/api';
const loginUrl = '/login.html';
let currentMode = 'create';

// ========================================
// CONSTANTES
// ========================================

const DISPLAY_STYLES = {
    BLOCK: 'block',
    NONE: 'none',
    FLEX: 'flex',
    TABLE: 'table'
};

const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
};

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    displayUserName();
    loadUsers();
    setupEventListeners();
});

// ========================================
// AUTENTICAÇÃO
// ========================================

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        globalThis.window.location.href = loginUrl;
        return null;
    }
    return token;
}

function displayUserName() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('user-name').textContent = user.name;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    globalThis.window.location.href = loginUrl;
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    document.getElementById('btn-logout').addEventListener('click', logout);
    document.getElementById('btn-new-user').addEventListener('click', () => {
        openModal('create');
    });
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('user-modal').addEventListener('click', (e) => {
        if (e.target.id === 'user-modal') {
            closeModal();
        }
    });
    document.getElementById('user-form').addEventListener('submit', handleSubmit);
    document.getElementById('users-list').addEventListener('click', handleTableClick);
}

// ========================================
// HANDLERS DE EVENTOS
// ========================================

function handleTableClick(e) {
    const target = e.target;
    
    if (target.classList.contains('btn-warning')) {
        const row = target.closest('tr');
        const id = Number.parseInt(row.cells[0].textContent);
        editUser(id);
    }
    
    if (target.classList.contains('btn-danger')) {
        const row = target.closest('tr');
        const id = Number.parseInt(row.cells[0].textContent);
        deleteUser(id);
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('user-name-input').value;
    const email = document.getElementById('user-email-input').value;
    const password = document.getElementById('user-password-input').value;

    if (currentMode === 'create') {
        await createUser({ name, email, password });
    } else {
        const id = document.getElementById('user-id').value;
        await updateUser(id, { name, email });
    }
}

// ========================================
// FUNÇÕES DE MENSAGEM
// ========================================

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = DISPLAY_STYLES.BLOCK;
    
    setTimeout(() => {
        message.style.display = DISPLAY_STYLES.NONE;
    }, 5000);
}

// ========================================
// CARREGAR USUÁRIOS
// ========================================

async function loadUsers() {
    const token = checkAuth();
    if (!token) {
        logout();
        return;
    }

    showSection('loading');
    hideSection('users-table');
    hideSection('empty-state');

    let response;
    try {
        response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        hideSection('loading');
        showMessage('Erro ao conectar com o servidor', 'error');
        return;
    }

    const data = await response.json();
    hideSection('loading');

    if (!response.ok) {
        if (response.status === 401) {
            logout();
            return;
        }
        showMessage(data.message || 'Erro ao carregar usuários', 'error');
        return;
    }

    const users = data.data || [];
    if (users.length === 0) {
        showSection('empty-state');
        return;
    }

    showSection('users-table');
    displayUsers(users);
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function showSection(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = DISPLAY_STYLES.BLOCK;
}

function hideSection(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = DISPLAY_STYLES.NONE;
}

function displayUsers(users) {
    const tbody = document.getElementById('users-list');
    tbody.innerHTML = '';

    for (const user of users) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
            <td class="actions">
                <button class="btn btn-sm btn-warning">Editar</button>
                <button class="btn btn-sm btn-danger">Deletar</button>
            </td>
        `;
        tbody.appendChild(tr);
    }

    document.getElementById('users-table').style.display = DISPLAY_STYLES.TABLE;
}

// ========================================
// FUNÇÕES AUXILIARES DE API
// ========================================

async function makeAuthRequest(endpoint, options = {}) {
    const token = checkAuth();
    
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`
    };
    
    if (options.body) {
        defaultHeaders['Content-Type'] = 'application/json';
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    
    return fetch(`${API_URL}${endpoint}`, config);
}

async function handleApiResponse(response, successMessage, errorPrefix) {
    const result = await response.json();
    
    if (response.ok) {
        showMessage(successMessage, 'success');
        return { success: true, data: result.data };
    }
    
    showMessage(result.message || `Erro ao ${errorPrefix}`, 'error');
    return { success: false };
}

async function handleApiError(error, errorPrefix) {
    console.error(`Erro ao ${errorPrefix}:`, error);
    showMessage('Erro ao conectar com o servidor', 'error');
}

// ========================================
// CRUD - CRIAR USUÁRIO
// ========================================

async function createUser(data) {
    try {
        const response = await makeAuthRequest('/auth/register', {
            method: HTTP_METHODS.POST,
            body: data
        });
        
        const result = await handleApiResponse(
            response,
            'Usuário criado com sucesso!',
            'criar usuário'
        );
        
        if (result.success) {
            closeModal();
            loadUsers();
        }
    } catch (error) {
        handleApiError(error, 'criar usuário');
    }
}

// ========================================
// CRUD - BUSCAR USUÁRIO POR ID
// ========================================

async function editUser(id) {
    try {
        const response = await makeAuthRequest(`/users/${id}`);
        
        const result = await handleApiResponse(
            response,
            '', // Sem mensagem de sucesso
            'buscar usuário'
        );
        
        if (result.success) {
            openModal('edit', result.data);
        }
    } catch (error) {
        handleApiError(error, 'buscar usuário');
    }
}

// ========================================
// CRUD - ATUALIZAR USUÁRIO
// ========================================

async function updateUser(id, data) {
    try {
        const response = await makeAuthRequest(`/users/${id}`, {
            method: HTTP_METHODS.PATCH,
            body: data
        });
        
        const result = await handleApiResponse(
            response,
            'Usuário atualizado com sucesso!',
            'atualizar usuário'
        );
        
        if (result.success) {
            closeModal();
            loadUsers();
        }
    } catch (error) {
        handleApiError(error, 'atualizar usuário');
    }
}

// ========================================
// CRUD - DELETAR USUÁRIO
// ========================================

async function deleteUser(id) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
        return;
    }

    try {
        const response = await makeAuthRequest(`/users/${id}`, {
            method: HTTP_METHODS.DELETE
        });
        
        const result = await handleApiResponse(
            response,
            'Usuário deletado com sucesso!',
            'deletar usuário'
        );
        
        if (result.success) {
            loadUsers();
        }
    } catch (error) {
        handleApiError(error, 'deletar usuário');
    }
}

// ========================================
// MODAL
// ========================================

function openModal(mode, user = null) {
    currentMode = mode;
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    const passwordField = document.getElementById('password-group');
    
    form.reset();

    if (mode === 'create') {
        document.getElementById('modal-title').textContent = 'Novo Usuário';
        document.getElementById('submit-btn').textContent = 'Criar Usuário';
        passwordField.style.display = DISPLAY_STYLES.BLOCK;
        document.getElementById('user-password-input').required = true;
    } else {
        document.getElementById('modal-title').textContent = 'Editar Usuário';
        document.getElementById('submit-btn').textContent = 'Atualizar Usuário';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name-input').value = user.name;
        document.getElementById('user-email-input').value = user.email;
        passwordField.style.display = DISPLAY_STYLES.NONE;
        document.getElementById('user-password-input').required = false;
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('user-modal').classList.remove('active');
}