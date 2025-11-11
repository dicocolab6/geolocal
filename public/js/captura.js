// Preencher dropdown com parentes do usuário logado
    fetch('/api/parentes', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    .then(r=>r.json()).then(data => {
      const select = document.getElementById('parente-select');
      (data.data || []).forEach(parente => {
        const opt = document.createElement('option');
        opt.value = parente.id_par;
        opt.text = parente.nome;
        select.appendChild(opt);
      });
    });
    
    document.getElementById('enviar-loc').onclick = function() {
      const id_par = document.getElementById('parente-select').value;
      if (!id_par) return alert('Escolha o parente!');
      if (!navigator.geolocation) {
        alert('Navegador não suporta geolocalização.');
        return;
      }
      navigator.geolocation.getCurrentPosition(function(pos) {
        fetch('/api/relacoes', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_par: id_par,
            coord_x: pos.coords.latitude,
            coord_y: pos.coords.longitude
          })
        })
        .then(r=>r.json())
        .then(r => {
          document.getElementById('msg').textContent =
            r.data ? 'Localização registrada com sucesso!' : (r.message || 'Erro!');
        });
      }, function(erro){
        document.getElementById('msg').textContent = 'Erro ao obter localização: ' + erro.message;
      });
    }