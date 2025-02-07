export const calculateAverage = (stats: any) => {
  const ganadas = stats?.partidasGanadas || 0;
  const perdidas = stats?.partidasPerdidas || 0;
  const totalPartidas = ganadas + perdidas;
  if (totalPartidas > 0) {
    return (ganadas / totalPartidas).toFixed(3);
  } else {
    return "-";
  }
};

export const categorizePlayers = (players: any[]) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // Los meses en JavaScript son 0-indexados

  // Ordenar jugadores por average del mes actual de mayor a menor
  const sortedPlayers = players.sort((a, b) => {
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