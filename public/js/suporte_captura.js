// Preencher nome do parente logado
      const parente = JSON.parse(localStorage.getItem('parente'));
      document.getElementById('parente-name').textContent = parente ? parente.nome : 'Parente';

      // Logout simples do parente
      document.getElementById('btn-logout').onclick = function() {
          localStorage.removeItem('parente-token');
          localStorage.removeItem('parente');
          window.location.href = '/parente-login.html';
      };

      // Handler de captura
      document.getElementById('btn-captura').onclick = function() {
        const token = localStorage.getItem('parente-token');
        const id_par = parente.id_par;
        const id_usr = parente.id_usr;
        const message = document.getElementById('message');
        message.textContent = '';
        document.getElementById('loading').style.display = 'block';
        document.getElementById('result').textContent = '';
        if (!navigator.geolocation) {
          message.textContent = 'Seu navegador não suporta geolocalização.';
          document.getElementById('loading').style.display = 'none';
          return;
        }
        navigator.geolocation.getCurrentPosition(function(pos) {
          fetch('/api/relacoes', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id_par: id_par,
              id_usr: id_usr,
              coord_x: pos.coords.latitude,
              coord_y: pos.coords.longitude
            })
          })
          .then(r => r.json())
          .then(r => {
            document.getElementById('loading').style.display = 'none';
            if (r.data) {
              document.getElementById('message').textContent = 'Localização registrada!';
              document.getElementById('result').innerHTML =
                'Latitude: ' + r.data.coord_x + '<br>Longitude: ' + r.data.coord_y + '<br><b>Data:</b> ' + new Date(r.data.capturado_em).toLocaleString('pt-BR');
            } else {
              document.getElementById('message').textContent = r.message || 'Erro ao salvar localização.';
            }
          });
        }, function(err){
            message.textContent = 'Erro ao obter localização: ' + err.message;
            document.getElementById('loading').style.display = 'none';
        });
      };