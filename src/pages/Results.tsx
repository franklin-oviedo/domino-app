import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlayersByLeague } from "../services/playersService";

export const Results = () => {
  const { leagueId, equipoGanador } = useParams();
  const [jugadores, setJugadores] = useState<any[]>([]);

  useEffect(() => {
    if (!leagueId) return;

    const unsubscribe = getPlayersByLeague(leagueId, setJugadores);

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [leagueId]);

  const jugadoresGanadores = jugadores.filter((_, index) =>
    equipoGanador === "1" ? index < 2 : index >= 2
  );

  return (
    <div>
      <h2 className="text-center mb-4">Resultados de la Partida</h2>
      <h3 className="text-center">
        ¡El equipo {equipoGanador === "1" ? "1" : "2"} ha ganado!
      </h3>
      <h4 className="text-center">Jugadores Ganadores:</h4>
      <ul className="list-group">
        {jugadoresGanadores.map((jugador) => (
          <li key={jugador.id} className="list-group-item">
            {jugador.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
