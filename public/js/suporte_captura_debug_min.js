// /public/js/suporte_captura_debug_min.js
// Utilidades de debug
const $d = document.getElementById.bind(document);
const debugEl = $d('debug');
function log(msg, cls='') {
  const div = document.createElement('div');
  div.className = `debug-line ${cls}`;
  div.textContent = msg;
  debugEl.appendChild(div);
}

const parente = JSON.parse(localStorage.getItem('parente'));
const token = localStorage.getItem('parente-token') || localStorage.getItem('token');

$d('parente-name').textContent = parente ? parente.nome : 'Parente';
$d('btn-logout').onclick = () => {
  localStorage.removeItem('parente-token');
  localStorage.removeItem('parente');
  window.location.href = '/parente-login.html';
};

const message = $d('message');
const loading = $d('loading');
const result = $d('result');

// Log de sessão (confirma que o front tem o mesmo contexto do back)
log(`[Sessão] parente: ${parente ? JSON.stringify({ id_par: parente.id_par, id_usr: parente.id_usr, nome: parente.nome }) : 'null'}`, parente ? 'ok' : 'warn');
log(`[Sessão] token presente: ${!!token}`, token ? 'ok' : 'err');

// Verificação opcional da última posição no banco antes de capturar
async function verificarUltima() {
  if (!parente?.id_par) {
    log('[Confirmação] id_par ausente, pulando GET /api/relacoes/ultima', 'warn');
    return;
  }
  try {
    log(`[Confirmação] GET /api/relacoes/ultima/${parente.id_par}`);
    const r = await fetch(`/api/relacoes/ultima/${parente.id_par}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const j = await r.json().catch(() => ({}));
    log(`[Confirmação] status=${r.status}`, r.ok ? 'ok' : 'warn');
    log(`[Confirmação] body=${JSON.stringify(j)}`, 'muted');
    if (r.ok && j?.data) {
      result.innerHTML = `Latitude: ${j.data.coord_x}<br>Longitude: ${j.data.coord_y}<br><b>Data:</b> ${new Date(j.data.capturado_em).toLocaleString('pt-BR')}`;
    }
  } catch (e) {
    log(`[Confirmação] erro: ${e.message}`, 'err');
  }
}

// Captura + envio
$d('btn-captura').onclick = function () {
  message.textContent = '';
  result.textContent = '';
  loading.style.display = 'block';

  if (!parente?.id_par) {
    const m = 'Sessão inválida: parente não encontrado (localStorage.parente).';
    message.textContent = m;
    log(`[Falha] ${m}`, 'err');
    loading.style.display = 'none';
    return;
  }
  if (!token) {
    const m = 'Sessão inválida: token não encontrado.';
    message.textContent = m;
    log(`[Falha] ${m}`, 'err');
    loading.style.display = 'none';
    return;
  }
  if (!navigator.geolocation) {
    const m = 'Seu navegador não suporta geolocalização.';
    message.textContent = m;
    log(`[Falha] ${m}`, 'err');
    loading.style.display = 'none';
    return;
  }

  log('[Geo] requisitando posição (getCurrentPosition)...');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = Number(pos.coords.latitude);
    const lng = Number(pos.coords.longitude);
    log(`[Geo] obtida lat=${lat} lng=${lng} acc=${pos.coords.accuracy}`, 'ok');

    const body = { id_par: parente.id_par, coord_x: lat, coord_y: lng };
    const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

    log(`[POST] /api/relacoes headers: Authorization=Bearer ...; Content-Type=application/json`, 'muted');
    log(`[POST] body: ${JSON.stringify(body)}`, 'muted');

    try {
      const resp = await fetch('/api/relacoes', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const text = await resp.text(); // captura bruto p/ debug
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      log(`[POST] status=${resp.status}`, resp.ok ? 'ok' : 'warn');
      log(`[POST] response=${JSON.stringify(data)}`);

      loading.style.display = 'none';

      if (resp.ok && data?.data) {
        message.textContent = 'Localização registrada!';
        result.innerHTML =
          `Latitude: ${data.data.coord_x}<br>` +
          `Longitude: ${data.data.coord_y}<br>` +
          `<b>Data:</b> ${new Date(data.data.capturado_em).toLocaleString('pt-BR')}`;
        // Confirma no banco logo após salvar
        await verificarUltima();
      } else {
        message.textContent = data?.message || 'Erro ao salvar localização.';
      }
    } catch (e) {
      loading.style.display = 'none';
      message.textContent = 'Erro ao enviar localização.';
      log(`[POST] exceção: ${e.message}`, 'err');
    }
  }, (err) => {
    loading.style.display = 'none';
    const m = `Erro ao obter localização: ${err.message}`;
    message.textContent = m;
    log(`[Geo] erro: code=${err.code} msg=${err.message}`, 'err');
  }, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });
};

// Chamada inicial para ver o que há no banco antes de clicar
verificarUltima();
