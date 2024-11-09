// src/components/Resultados.js
import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useParams } from "react-router-dom";

function Resultados() {
  const { ligaId, equipoGanador } = useParams();
  const [jugadores, setJugadores] = useState<any[]>([]);

  useEffect(() => {
    const jugadoresRef = ref(database, `ligas/${ligaId}/jugadores`);
    onValue(jugadoresRef, (snapshot) => {
      const data = snapshot.val();
      const jugadoresList = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setJugadores(jugadoresList);
    });
  }, [ligaId]);

  const jugadoresGanadores = jugadores.filter(
    (jugador, index) =>
      (equipoGanador === "1" && index < 2) ||
      (equipoGanador === "2" && index >= 2)
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
}

export default Resultados;
