(async function () { 
  const token = localStorage.getItem('admin-token');
  if (!token) {
    alert('Sessão de admin expirada. Faça login novamente.');
    window.location.href = '/admin-login.html';
    return;
  }

  // Inicializa mapa
  const map = L.map('map').setView([-14.235, -51.925], 4);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Busca dados
  try {
    const resp = await fetch('/api/admin/parentes-coordenadas', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!resp.ok) throw new Error('Falha ao carregar coordenadas');
    const itens = await resp.json();

    if (!Array.isArray(itens) || itens.length === 0) {
      L.popup().setLatLng(map.getCenter())
        .setContent('Nenhuma coordenada cadastrada.')
        .openOn(map);
      return;
    }

    // Adiciona marcadores
    itens.forEach(it => {
      if (it.coord_x && it.coord_y) {
        L.marker([it.coord_x, it.coord_y])
          .addTo(map)
          .bindTooltip(
            `<b>${it.nome}</b><br>` +
            `Usuário: ${it.id_usr}<br>` +
            `${new Date(it.capturado_em).toLocaleString('pt-BR')}`,
            { direction: 'top' }
          );
      }
    });
  } catch (e) {
    console.error(e);
    alert('Erro ao carregar mapa/coord.');
  }
})();
