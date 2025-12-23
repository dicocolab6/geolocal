// /public/js/captura-localizacao-mapa.js
// Captura e exibição de localização no mapa para parentes
// Mostrar nome do parente
const parente = JSON.parse(localStorage.getItem('parente'));
document.getElementById('parente-name').textContent = parente ? parente.nome : 'Parente';

// Logout
document.getElementById('btn-logout').onclick = function () {
  localStorage.removeItem('parente-token');
  localStorage.removeItem('parente');
  window.location.href = '/parente-login.html';
};

const token = localStorage.getItem('parente-token') || localStorage.getItem('token');
const msg = document.getElementById('message');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

let map, marker;

// Inicializa mapa (centro no Brasil por padrão)
function initMap() {
  map = L.map('map').setView([-14.2, -51.9], 4);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
}
initMap();

// Atualiza UI e marcador no mapa
function renderLocation(lat, lng, datetime) {
  result.innerHTML = `
    <b>Última localização:</b><br>
    Latitude: ${lat}<br>
    Longitude: ${lng}<br>
    Data: ${new Date(datetime).toLocaleString('pt-BR')}
  `;
  if (!marker) {
    marker = L.marker([lat, lng]).addTo(map);
  } else {
    marker.setLatLng([lat, lng]);
  }
  map.setView([lat, lng], 16);
  marker.bindTooltip(`<b>${parente?.nome || 'Parente'}</b><br>${new Date(datetime).toLocaleString('pt-BR')}`, {
    permanent: true,
    direction: 'top',
    offset: [0, -18]
  });
}

// Busca a última localização do parente e exibe no mapa (se existir)
async function carregarUltimaLocalizacao() {
  if (!parente || !parente.id_par) return;
  try {
    const resp = await fetch(`/api/relacoes/ultima/${parente.id_par}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!resp.ok) {
      result.textContent = 'Nenhuma localização registrada ainda.';
      return;
    }
    const data = await resp.json();
    if (data.data && data.data.coord_x && data.data.coord_y) {
      renderLocation(data.data.coord_x, data.data.coord_y, data.data.capturado_em);
    } else {
      result.textContent = 'Nenhuma localização registrada ainda.';
    }
  } catch (e) {
    result.textContent = 'Erro ao buscar última localização.';
  }
}
carregarUltimaLocalizacao();

// Capturar e enviar localização atual
document.getElementById('btn-captura').onclick = function () {
  if (!parente || !parente.id_par) {
    msg.textContent = 'Parente não identificado na sessão.';
    return;
  }
  if (!navigator.geolocation) {
    msg.textContent = 'Seu navegador não suporta geolocalização.';
    return;
  }

  msg.textContent = '';
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
        msg.textContent = 'Localização registrada com sucesso!';
        renderLocation(data.data.coord_x, data.data.coord_y, data.data.capturado_em);
      } else {
        msg.textContent = data.message || 'Erro ao salvar localização.';
      }
    } catch (e) {
      loading.style.display = 'none';
      msg.textContent = 'Erro ao enviar localização.';
    }
  }, (err) => {
    loading.style.display = 'none';
    msg.textContent = 'Erro ao obter localização: ' + err.message;
  }, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });
};
