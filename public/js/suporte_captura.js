// Mostrar nome do parente logado
const parente = JSON.parse(localStorage.getItem('parente'));
document.getElementById('parente-name').textContent = parente ? parente.nome : 'Parente';

// Logout
document.getElementById('btn-logout').onclick = function () {
  localStorage.removeItem('parente-token');
  localStorage.removeItem('parente');
  window.location.href = '/parente-login.html';
};

const token = localStorage.getItem('parente-token'); // token do login de parente
const message = document.getElementById('message');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

document.getElementById('btn-captura').onclick = function () {
  if (!parente || !parente.id_par) {
    message.textContent = 'Sessão inválida: parente não encontrado.';
    return;
  }
  if (!token) {
    message.textContent = 'Sessão inválida: token não encontrado.';
    return;
  }
  if (!navigator.geolocation) {
    message.textContent = 'Seu navegador não suporta geolocalização.';
    return;
  }

  message.textContent = '';
  result.textContent = '';
  loading.style.display = 'block';

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const body = {
        id_par: parente.id_par,
        coord_x: pos.coords.latitude,
        coord_y: pos.coords.longitude
      };
      const resp = await fetch('/api/relacoes', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      loading.style.display = 'none';

      if (resp.ok && data.data) {
        message.textContent = 'Localização registrada!';
        result.innerHTML = 'Latitude: ' + data.data.coord_x +
                           '<br>Longitude: ' + data.data.coord_y +
                           '<br><b>Data:</b> ' + new Date(data.data.capturado_em).toLocaleString('pt-BR');
      } else {
        message.textContent = data.message || 'Erro ao salvar localização.';
      }
    } catch (e) {
      loading.style.display = 'none';
      message.textContent = 'Erro ao enviar localização.';
    }
  }, (err) => {
    loading.style.display = 'none';
    message.textContent = 'Erro ao obter localização: ' + err.message;
  }, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });
};


// // Preencher nome do parente logado
//       const parente = JSON.parse(localStorage.getItem('parente'));
//       document.getElementById('parente-name').textContent = parente ? parente.nome : 'Parente';

//       // Logout simples do parente
//       document.getElementById('btn-logout').onclick = function() {
//           localStorage.removeItem('parente-token');
//           localStorage.removeItem('parente');
//           window.location.href = '/parente-login.html';
//       };

//       // Handler de captura
//       document.getElementById('btn-captura').onclick = function() {
//         const token = localStorage.getItem('parente-token');
//         const id_par = parente.id_par;
//         const id_usr = parente.id_usr;
//         const message = document.getElementById('message');
//         message.textContent = '';
//         document.getElementById('loading').style.display = 'block';
//         document.getElementById('result').textContent = '';
//         if (!navigator.geolocation) {
//           message.textContent = 'Seu navegador não suporta geolocalização.';
//           document.getElementById('loading').style.display = 'none';
//           return;
//         }
//         navigator.geolocation.getCurrentPosition(function(pos) {
//           fetch('/api/relacoes', {
//             method: 'POST',
//             headers: {
//               'Authorization': 'Bearer ' + token,
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//               id_par: id_par,
//               id_usr: id_usr,
//               coord_x: pos.coords.latitude,
//               coord_y: pos.coords.longitude
//             })
//           })
//           .then(r => r.json())
//           .then(r => {
//             document.getElementById('loading').style.display = 'none';
//             if (r.data) {
//               document.getElementById('message').textContent = 'Localização registrada!';
//               document.getElementById('result').innerHTML =
//                 'Latitude: ' + r.data.coord_x + '<br>Longitude: ' + r.data.coord_y + '<br><b>Data:</b> ' + new Date(r.data.capturado_em).toLocaleString('pt-BR');
//             } else {
//               document.getElementById('message').textContent = r.message || 'Erro ao salvar localização.';
//             }
//           });
//         }, function(err){
//             message.textContent = 'Erro ao obter localização: ' + err.message;
//             document.getElementById('loading').style.display = 'none';
//         });

//       };

