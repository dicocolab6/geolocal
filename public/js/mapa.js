// /js/mapa.js

// Somente cuidar do mapa Leaflet e marcadores.
document.addEventListener('DOMContentLoaded', function() {
  // Inicializa mapa centrado no Brasil
  var map = L.map('map').setView([-14.2, -51.9], 4);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const token = localStorage.getItem('token');
  if (!token) return;

  // Busca os parentes cadastrados
  fetch('/api/parentes', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => {
    const parentes = data.data || [];
    parentes.forEach(parente => {
      // Para cada parente, busca sua última localização
      fetch(`/api/relacoes/ultima/${parente.id_par}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r2 => r2.json())
      .then(loc => {
        if (loc.data && loc.data.coord_x && loc.data.coord_y) {
          // Adiciona marcador no mapa!
          const marker = L.marker([loc.data.coord_x, loc.data.coord_y]).addTo(map);
          marker.bindPopup(
            `<b>${parente.nome}</b><br>Latitude: ${loc.data.coord_x}<br>Longitude: ${loc.data.coord_y}<br><small>${new Date(loc.data.capturado_em).toLocaleString('pt-BR')}</small>`
          );
        }
      });
    });
  });
});
