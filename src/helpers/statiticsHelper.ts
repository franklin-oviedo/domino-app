export const calculateAverage = (stats: any) => {
  const ganadas = stats?.Ganadas || 0;
  const perdidas = stats?.Perdidas || 0;
  const totalPartidas = ganadas + perdidas;
  if (totalPartidas > 0) {
    return (ganadas / totalPartidas).toFixed(3);
  } else {
    return "-";
  }
};

export const categorizePlayers = (players: any[]) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'numeric' }); 

  const sortedPlayers = players.sort((a, b) => {
    //console.log(a.statics?.[currentYear]?.[1]);
    const avgA = parseFloat(calculateAverage(a.statics?.[currentYear]?.[currentMonth]));
    const avgB = parseFloat(calculateAverage(b.statics?.[currentYear]?.[currentMonth]));
    return avgB - avgA;
  });

  // Categorizar jugadores en grupos de 3
  const legendarios = sortedPlayers.slice(0, 3);
  const veteranos = sortedPlayers.slice(3, 6);
  const pro = sortedPlayers.slice(6, 9);
  const rikili = sortedPlayers.slice(9);

  return { legendarios, veteranos, pro, rikili };
};