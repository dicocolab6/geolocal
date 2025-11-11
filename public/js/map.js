let map;
function initMap() {
  map = L.map('map').setView([-14.2, -51.9], 4); // Brasil
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
}
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  // ... já existentes
});

async function plotarLocalizacoes(parentes) {
  for (const parente of parentes) {
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch(`/api/relacoes/ultima/${parente.id_par}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.data && data.data.coord_x && data.data.coord_y) {
        const marker = L.marker([data.data.coord_x, data.data.coord_y]).addTo(map);
        marker.bindPopup(
          `<b>${parente.nome}</b><br>Lat: ${data.data.coord_x.toFixed(5)}<br>Lng: ${data.data.coord_y.toFixed(5)}<br>`+
          `<small>${new Date(data.data.capturado_em).toLocaleString('pt-BR')}</small>`
        );
      }
    } catch {}
  }
}
// Chame dentro de displayParentes(parentes)
