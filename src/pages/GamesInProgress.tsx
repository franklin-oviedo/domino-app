// src/components/PartidasEnCurso.js
import React, { useEffect, useState } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useParams, Link } from 'react-router-dom';

export const GamesInProgress = () => {
  const { leagueId } = useParams();
  const [partidas, setPartidas] = useState<any[]>([]);

  useEffect(() => {
    const partidasRef = ref(database, `ligas/${leagueId}/partidas/`); // Ajusta la ruta según tu estructura de datos
    onValue(partidasRef, (snapshot) => {
      const data = snapshot.val();
      const partidasList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setPartidas(partidasList);
    });
  }, [leagueId]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Partidas en Curso</h2>
      {partidas.length === 0 ? (
        <p className="text-center">No hay partidas en curso.</p>
      ) : (
        <div className="list-group">
          {partidas.map((partida) => (
            <div key={partida.id} className="list-group-item">
              <h5 className="mb-1">Partida ID: {partida.id}</h5>
              <p className="mb-1">Jugadores: {partida.jugadores.join(', ')}</p>
              <p className="mb-1">Puntos: {partida.puntos}</p>
              <Link to={`/anotar-puntos/${partida.id}`} className="btn btn-primary">
                Entrar a la Partida
              </Link>
            </div>
          ))}
        </div>
      )}
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-secondary">Volver al Home</Link>
      </div>
    </div>
  );
}
