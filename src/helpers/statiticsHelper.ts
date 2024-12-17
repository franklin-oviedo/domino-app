

export const categorizePlayers = (players: any[], isFilteredByMonth:boolean = false, year:number, month:number = 0) => {
   
     console.log(players);
     console.log(isFilteredByMonth);
     console.log(year);
     console.log(month);
     
     
    if(isFilteredByMonth) averageByMonth(players,year,month);
    else  averageByYear(players,year);

    const updatedPlayers = organizePlayers(players);
    
    const legendarios = updatedPlayers.slice(0, 4);
    const veteranos = updatedPlayers.slice(4, 8);
    const pro = updatedPlayers.slice(8, 12);
    const rikili = updatedPlayers.slice(12);

    return { legendarios, veteranos, pro, rikili };
  };

  const calculateAverage = (stats: any) => {
    const ganadas = stats?.partidasGanadas || 0;
    const perdidas = stats?.partidasPerdidas || 0;
    const totalPartidas = ganadas + perdidas;
    if (totalPartidas > 0) {
      return Math.round(((ganadas / totalPartidas) * 100));
    } else {
      return 0;
    }
  };

  const organizePlayers = (players: any[]) => {
    
    const updatedPlayers = players.map((player)=>{
      return {...player, average: calculateAverage(player)}
    });

    updatedPlayers.sort((a,b) => b.average - a.average);

    return updatedPlayers;
  };

  const averageByYear = (players: any[], year:number) => {
    
    players.forEach((player) => {
      if(player?.statics && player?.statics[year]){     
        const yearMonths = player?.statics[year];
          let totalWon = yearMonths.reduce((accumulator: number, current: any) => {
            // Ensure current.Ganadas is a number and add it to the accumulator
            return accumulator + (typeof current.Ganadas === 'number' ? current.Ganadas : 0);
          }, 0);

          let totalLost = yearMonths.reduce((accumulator: number, current: any) => {
           // Ensure current.Perdidas is a number and add it to the accumulator
            return accumulator + (typeof current.Perdidas === 'number' ? current.Perdidas : 0);
          }, 0);
         
          player['partidasGanadas'] = totalWon;
          player['partidasPerdidas'] = totalLost;
      }else{
        player['partidasGanadas'] = 0;
        player['partidasPerdidas'] = 0;
      }
    });

    return players;
  };

  const averageByMonth = (players: any[], year:number, month:number) => {
    
    players.forEach((player) => {
      if(player?.statics && player?.statics[year][month]){
        const { Ganadas, Perdidas } = player?.statics[year][month];
        player['partidasGanadas'] = Ganadas;
        player['partidasPerdidas'] = Perdidas;
      }   
    });

    return players;
  };