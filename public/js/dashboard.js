const API_URL = '/api';
const loginUrl = '/login.html';
let currentMode = 'create';

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

// ================================
// INICIALIZAÇÃO
// ================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    displayUserName();
    loadParentes();
    setupEventListeners();
});

// ================================
// AUTENTICAÇÃO
// ================================
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

// ================================
// EVENT LISTENERS
// ================================
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

// ================================
// HANDLERS DE EVENTOS
// ================================
function handleTableClick(e) {
    const target = e.target;
    if (target.classList.contains('btn-warning')) {
        const row = target.closest('tr');
        const id = Number.parseInt(row.cells[0].textContent);
        editParente(id);
    }
    if (target.classList.contains('btn-danger')) {
        const row = target.closest('tr');
        const id = Number.parseInt(row.cells[0].textContent);
        deleteParente(id);
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const nome = document.getElementById('user-name-input').value;
    const email = document.getElementById('user-email-input').value;
    const senha = document.getElementById('user-password-input').value;
    const android_id =
        document.getElementById('user-android-id-input').value || null;

    if (currentMode === 'create') {
        await createParente({ nome, email, senha, android_id });
    } else {
        const id = document.getElementById('user-id').value;
        await updateParente(id, { nome, email, android_id });
    }
}


// ================================
// FUNÇÕES DE MENSAGEM
// ================================
function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = DISPLAY_STYLES.BLOCK;
    setTimeout(() => {
        message.style.display = DISPLAY_STYLES.NONE;
    }, 5000);
}

//================================
// FUNÇÕES DE EXIBIÇÃO DE SEÇÕES
//================================
// function showSection(sectionId) {
//     document.getElementById(sectionId).style.display = DISPLAY_STYLES.BLOCK;
// }

function showSection(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

// function hideSection(sectionId) {
//     document.getElementById(sectionId).style.display = DISPLAY_STYLES.NONE;
// }
function hideSection(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ================================
// CARREGAR PARENTES
// ================================
async function loadParentes() {
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
        response = await fetch(`${API_URL}/parentes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        hideSection('loading');
        showMessage('Erro ao conectar ao servidor', 'error');
        return;
    }
    const data = await response.json();
    hideSection('loading');
    if (!response.ok) {
        showMessage(data.message || 'Erro ao carregar parentes', 'error');
        return;
    }
    const parentes = data.data || [];
    if (parentes.length === 0) {
        showSection('empty-state');
        return;
    }
    showSection('users-table');
    displayParentes(parentes);
}

function displayParentes(parentes) {
    const tbody = document.getElementById('users-list');
    tbody.innerHTML = '';
    for (const parente of parentes) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${parente.id_par}</td>
            <td>${parente.nome}</td>
            <td>${parente.email}</td>
            <td>${parente.android_id || ''}</td>
            <td>${new Date(parente.criado_em).toLocaleDateString('pt-BR')}</td>
            <td class="actions">
                <button class="btn btn-sm btn-warning">Editar</button>
                <button class="btn btn-sm btn-danger">Deletar</button>
            </td>
        `;
        tbody.appendChild(tr);
    }
    document.getElementById('users-table').style.display = DISPLAY_STYLES.TABLE;
}

// ================================
// FUNÇÕES DE REQUISIÇÕES
// ================================
async function makeAuthRequest(endpoint, options = {}) {
    const token = checkAuth();
    const defaultHeaders = { 'Authorization': `Bearer ${token}` };
    if (options.body) {
        defaultHeaders['Content-Type'] = 'application/json';
    }
    const config = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
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
    showMessage('Erro ao conectar ao servidor', 'error');
}

// ================================
// CRUD - CRIAR PARENTE
// ================================
async function createParente(data) {
    try {
        const response = await makeAuthRequest('/parentes', {
            method: HTTP_METHODS.POST,
            body: data
        });
        const result = await handleApiResponse(
            response,
            'Parente criado com sucesso!',
            'criar parente'
        );
        if (result.success) {
            closeModal();
            loadParentes();
        }
    } catch (error) {
        handleApiError(error, 'criar parente');
    }
}

// ================================
// CRUD - EDITAR PARENTE POR ID
// ================================
async function editParente(id) {
    try {
        const response = await makeAuthRequest(`/parentes`, { method: HTTP_METHODS.GET });
        const result = await handleApiResponse(response, '', 'buscar parente');
        if (result.success) {
            const parente = result.data.find(item => item.id_par == id);
            if (parente) openModal('edit', parente);
        }
    } catch (error) {
        handleApiError(error, 'buscar parente');
    }
}

// ================================
// CRUD - ATUALIZAR PARENTE
// ================================
async function updateParente(id, data) {
    try {
        const response = await makeAuthRequest(`/parentes/${id}`, {
            method: HTTP_METHODS.PATCH,
            body: data
        });
        const result = await handleApiResponse(
            response,
            'Parente atualizado com sucesso!',
            'atualizar parente'
        );
        if (result.success) {
            closeModal();
            loadParentes();
        }
    } catch (error) {
        handleApiError(error, 'atualizar parente');
    }
}

// ================================
// CRUD - DELETAR PARENTE
// ================================
async function deleteParente(id) {
    if (!confirm('Tem certeza que deseja deletar este parente?')) return;
    try {
        const response = await makeAuthRequest(`/parentes/${id}`, {
            method: HTTP_METHODS.DELETE
        });
        const result = await handleApiResponse(
            response,
            'Parente deletado com sucesso!',
            'deletar parente'
        );
        if (result.success) loadParentes();
    } catch (error) {
        handleApiError(error, 'deletar parente');
    }
}

// ================================
// MODAL
// ================================
function openModal(mode, parente = null) {
    currentMode = mode;
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    const passwordField = document.getElementById('password-group');

    form.reset();

    if (mode === 'create') {
        document.getElementById('modal-title').textContent = 'Novo Parente';
        document.getElementById('submit-btn').textContent = 'Criar Parente';
        passwordField.style.display = DISPLAY_STYLES.BLOCK;
        document.getElementById('user-password-input').required = true;

        // 🔹 LIMPA android_id no modo criação
        document.getElementById('user-android-id-input').value = '';

    } else {
        document.getElementById('modal-title').textContent = 'Editar Parente';
        document.getElementById('submit-btn').textContent = 'Atualizar Parente';

        document.getElementById('user-id').value = parente.id_par;
        document.getElementById('user-name-input').value = parente.nome;
        document.getElementById('user-email-input').value = parente.email;

        // 🔥 🔥 🔥 A LINHA QUE VOCÊ PERGUNTOU É EXATAMENTE AQUI
        document.getElementById('user-android-id-input').value =
            parente.android_id || '';
        // if (parente && 'android_id' in parente) {
        //     document.getElementById('user-android-id-input').value =
        //         parente.android_id || '';
        // }

        passwordField.style.display = DISPLAY_STYLES.NONE;
        document.getElementById('user-password-input').required = false;
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('user-modal').classList.remove('active');
}
