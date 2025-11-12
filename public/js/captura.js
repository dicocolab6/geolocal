// Preenche o nome do parente (primeiro da lista, opcional)
const parente = JSON.parse(localStorage.getItem('parente'));
document.getElementById('parente-name').textContent = parente ? parente.nome : 'Parente';

// Logout
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) btnLogout.onclick = function() {
  localStorage.removeItem('parente-token');
  localStorage.removeItem('parente');
  window.location.href = '/parente-login.html';
};

const select = document.getElementById('parente-select');
const msg = document.getElementById('msg');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const token = localStorage.getItem('parente-token') || localStorage.getItem('token');

// Carregar parentes (apenas 1, se login por parente, mas mantém expansível)
fetch('/api/parentes', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(data => {
  (data.data || []).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id_par;
    opt.text = p.nome;
    select.appendChild(opt);
    // Se login único, já preencher nome
    if (parente && p.id_par == parente.id_par) {
      select.value = parente.id_par;
    }
  });
  atualizarUltimaLocalizacao();
});

// Capturar localização e enviar

document.getElementById('enviar-loc').onclick = function() {
  const id_par = select.value;
  if (!id_par) return alert('Escolha o parente!');
  if (!navigator.geolocation) {
    msg.textContent = 'Navegador não suporta geolocalização.';
    return;
  }
  loading.style.display = 'block';
  navigator.geolocation.getCurrentPosition(pos => {
    fetch('/api/relacoes', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_par, coord_x: pos.coords.latitude, coord_y: pos.coords.longitude
      })
    })
    .then(r => r.json())
    .then(r => {
      loading.style.display = 'none';
      msg.textContent = r.data ? 'Localização registrada com sucesso!' : (r.message || 'Erro!');
      atualizarUltimaLocalizacao();
    });
  }, erro => {
    loading.style.display = 'none';
    msg.textContent = 'Erro ao obter localização: ' + erro.message;
  });
};

// Mostra a localização mais recente do parente selecionado
function atualizarUltimaLocalizacao() {
  const id_par = select.value;
  if (!id_par) {
    result.textContent = '';
    return;
  }
  fetch(`/api/relacoes/ultima/${id_par}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(r => r.json())
    .then(r => {
      if (r.data) {
        result.innerHTML = `<b>Última localização:</b><br>Latitude: ${r.data.coord_x}<br>Longitude: ${r.data.coord_y}<br>Data: ${new Date(r.data.capturado_em).toLocaleString('pt-BR')}`;
      } else {
        result.textContent = 'Nenhuma localização registrada para este parente ainda.';
      }
    });
}

select.onchange = atualizarUltimaLocalizacao;


// // Preencher dropdown com parentes do usuário logado
//     fetch('/api/parentes', {
//       headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
//     })
//     .then(r=>r.json()).then(data => {
//       const select = document.getElementById('parente-select');
//       (data.data || []).forEach(parente => {
//         const opt = document.createElement('option');
//         opt.value = parente.id_par;
//         opt.text = parente.nome;
//         select.appendChild(opt);
//       });
//     });
    
//     document.getElementById('enviar-loc').onclick = function() {
//       const id_par = document.getElementById('parente-select').value;
//       if (!id_par) return alert('Escolha o parente!');
//       if (!navigator.geolocation) {
//         alert('Navegador não suporta geolocalização.');
//         return;
//       }
//       navigator.geolocation.getCurrentPosition(function(pos) {
//         fetch('/api/relacoes', {
//           method: 'POST',
//           headers: {
//             'Authorization': 'Bearer ' + localStorage.getItem('token'),
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             id_par: id_par,
//             coord_x: pos.coords.latitude,
//             coord_y: pos.coords.longitude
//           })
//         })
//         .then(r=>r.json())
//         .then(r => {
//           document.getElementById('msg').textContent =
//             r.data ? 'Localização registrada com sucesso!' : (r.message || 'Erro!');
//         });
//       }, function(erro){
//         document.getElementById('msg').textContent = 'Erro ao obter localização: ' + erro.message;
//       });

//     }
