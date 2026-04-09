// // mapa.js modificado para apenas uma requisição acelerando em 10x o carregamento do mapa.
// document.addEventListener('DOMContentLoaded', function () {

//   const map = L.map('map').setView([-14.2, -51.9], 4);

//   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; OpenStreetMap contributors'
//   }).addTo(map);

//   const token = localStorage.getItem('token');
//   if (!token) return;

//   fetch('/api/parentes/localizacoes', {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   })
//   .then(r => r.json())
//   .then(data => {

//     const parentes = data.data || [];

//     parentes.forEach(parente => {

//       if (!parente.latitude || !parente.longitude) return;

//       const marker = L.marker([parente.latitude, parente.longitude]).addTo(map);

//       marker.bindPopup(`
//         <b>${parente.nome}</b><br>
//         Latitude: ${parente.latitude}<br>
//         Longitude: ${parente.longitude}<br>
//         <small>${new Date(parente.capturado_em).toLocaleString('pt-BR')}</small>
//       `);

//     });

//   })
//   .catch(err => console.error("Erro ao carregar localizações:", err));

// });

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
