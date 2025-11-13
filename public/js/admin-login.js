 document.getElementById('admin-login-form').onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const senha = document.getElementById('admin-senha').value;
      const msg = document.getElementById('admin-login-msg');
      msg.textContent = '';
      try {
        const resp = await fetch('/api/admin-auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });
        const data = await resp.json();
        if (resp.ok && data.token) {
          localStorage.setItem('admin-token', data.token);
          localStorage.setItem('admin', JSON.stringify(data.admin));
          window.location.href = '/dashboard_admin.html';
        } else {
          msg.textContent = data.message || 'Login inválido.';
        }
      } catch(err) {
        msg.textContent = 'Erro ao tentar login.';
      }
    };