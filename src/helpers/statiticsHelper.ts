export const calculateAverage = (stats: any) => {
  const ganadas = stats?.Ganadas || 0;
  const perdidas = stats?.Perdidas || 0;
  const totalPartidas = ganadas + perdidas;
  if (totalPartidas > 0) {
    return (ganadas / totalPartidas).toFixed(3);
  } else {
    return "0.000"; 
  }
};

export const categorizePlayers = (players: any[]) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'numeric' });

  const sortedPlayers = players.sort((a, b) => {
    const avgA = parseFloat(calculateAverage(a.statics?.[currentYear]?.[currentMonth])) || 0;
    const avgB = parseFloat(calculateAverage(b.statics?.[currentYear]?.[currentMonth])) || 0;
    return avgB - avgA; // Ordena de mayor a menor
  });

  // Categorizar jugadores en grupos de 3
  const legendarios = sortedPlayers.slice(0, 3);
  const veteranos = sortedPlayers.slice(3, 6);
  const pro = sortedPlayers.slice(6, 9);
  const rikili = sortedPlayers.slice(9);

  return { legendarios, veteranos, pro, rikili };
};
