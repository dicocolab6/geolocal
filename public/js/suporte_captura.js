const debugEl = document.getElementById('debug');
function log(line, cls='') {
  const div = document.createElement('div');
  div.className = `debug-line ${cls}`;
  div.textContent = line;
  debugEl.appendChild(div);
}

const parente = JSON.parse(localStorage.getItem('parente'));
document.getElementById('parente-name').textContent = parente ? parente.nome : 'Parente';

document.getElementById('btn-logout').onclick = function () {
  localStorage.removeItem('parente-token');
  localStorage.removeItem('parente');
  window.location.href = '/parente-login.html';
};

const token = localStorage.getItem('parente-token') || localStorage.getItem('token');
const message = document.getElementById('message');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

// Sessão
log(`[Sessão] parente: ${parente ? JSON.stringify({ id_par: parente.id_par, id_usr: parente.id_usr, nome: parente.nome }) : 'null'}`);
log(`[Sessão] token presente: ${!!token}`, token ? 'ok' : 'warn');

async function confirmarNoBanco() {
  if (!parente?.id_par) {
    log('[Confirmação] id_par ausente — não é possível consultar última localização', 'warn');
    return;
  }
  try {
    const resp = await fetch(`/api/relacoes/ultima/${parente.id_par}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await resp.json();
    log(`[Confirmação] GET /api/relacoes/ultima/${parente.id_par} -> status ${resp.status}`);
    log(`[Confirmação] body: ${JSON.stringify(data)}`);
    if (resp.ok && data.data) {
      result.innerHTML =
        'Latitude: ' + data.data.coord_x +
        '<br>Longitude: ' + data.data.coord_y +
        '<br><b>Data:</b> ' + new Date(data.data.capturado_em).toLocaleString('pt-BR');
    }
  } catch (e) {
    log(`[Confirmação] erro: ${e.message}`, 'err');
  }
}

// Captura + envio
document.getElementById('btn-captura').onclick = function () {
  message.textContent = '';
  result.textContent = '';
  loading.style.display = 'block';

  if (!parente || !parente.id_par) {
    const m = 'Sessão inválida: parente não encontrado.';
    message.textContent = m;
    log(`[Erro] ${m}`, 'err');
    loading.style.display = 'none';
    return;
  }
  if (!token) {
    const m = 'Sessão inválida: token não encontrado.';
    message.textContent = m;
    log(`[Erro] ${m}`, 'err');
    loading.style.display = 'none';
    return;
  }
  if (!navigator.geolocation) {
    const m = 'Seu navegador não suporta geolocalização.';
    message.textContent = m;
    log(`[Erro] ${m}`, 'err');
    loading.style.display = 'none';
    return;
  }

  log('[Geo] solicitando posição atual...');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const acc = pos.coords.accuracy;
    log(`[Geo] obtida: lat=${lat}, lng=${lng}, acc=${acc}`, 'ok');

    const body = { id_par: parente.id_par, coord_x: lat, coord_y: lng };
    log(`[POST] /api/relacoes body: ${JSON.stringify(body)}`);
    try {
      const resp = await fetch('/api/relacoes', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      log(`[POST] status: ${resp.status}`);
      log(`[POST] response: ${JSON.stringify(data)}`);
      loading.style.display = 'none';

      if (resp.ok && data.data) {
        message.textContent = 'Localização registrada!';
        result.innerHTML =
          'Latitude: ' + data.data.coord_x +
          '<br>Longitude: ' + data.data.coord_y +
          '<br><b>Data:</b> ' + new Date(data.data.capturado_em).toLocaleString('pt-BR');
        // Confirma consultando o que está no banco agora
        await confirmarNoBanco();
      } else {
        message.textContent = data.message || 'Erro ao salvar localização.';
      }
    } catch (e) {
      loading.style.display = 'none';
      const m = 'Erro ao enviar localização: ' + e.message;
      message.textContent = m;
      log(`[POST] exceção: ${m}`, 'err');
    }
  }, (err) => {
    loading.style.display = 'none';
    const m = 'Erro ao obter localização: ' + err.message;
    message.textContent = m;
    log(`[Geo] erro: ${m}`, 'err');
  }, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });
};

// Ao carregar, tenta mostrar a última localização existente
confirmarNoBanco();



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


