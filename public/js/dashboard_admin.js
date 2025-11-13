// Verifica autenticação admin
    const adminToken = localStorage.getItem('admin-token');
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (!adminToken || !admin) {
      window.location.href = '/admin-login.html';
    } else {
      document.getElementById('admin-name').textContent = admin.nome;
      document.getElementById('admin-welcome-name').textContent = admin.nome;
    }
    document.getElementById('btn-logout').onclick = function() {
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin');
      window.location.href = '/admin-login.html';
    }