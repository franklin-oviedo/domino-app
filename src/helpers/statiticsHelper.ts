export const calculateAverage = (stats: any) => {
    const ganadas = stats?.partidasGanadas || 0;
    const perdidas = stats?.partidasPerdidas || 0;
    const totalPartidas = ganadas + perdidas;
    if (totalPartidas > 0) {
      return (ganadas / totalPartidas).toFixed(2);
    } else {
      return "-";
    }
  };

export const categorizePlayers = (players: any[]) => {
    const legendarios = players.slice(0, 4);
    const veteranos = players.slice(4, 8);
    const pro = players.slice(8, 12);
    const rikili = players.slice(12);

    return { legendarios, veteranos, pro, rikili };
  };