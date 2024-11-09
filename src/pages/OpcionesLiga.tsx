// src/components/OpcionesLiga.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';

function OpcionesLiga() {
  const { ligaId } = useParams();

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="list-group">
            <Link to={`/iniciar-partida/${ligaId}`} className="list-group-item list-group-item-action mb-3">
              <h5 className="mb-1">Iniciar Partida</h5>
              <p className="mb-1">Comienza una nueva partida en esta liga.</p>
            </Link>
            <Link to={`/estadisticas/${ligaId}`} className="list-group-item list-group-item-action mb-3">
              <h5 className="mb-1">Ver Estadísticas de Todos los Jugadores</h5>
              <p className="mb-1">Consulta las estadísticas de rendimiento de todos los jugadores.</p>
            </Link>
            <Link to={`/jugadores/${ligaId}`} className="list-group-item list-group-item-action mb-3">
              <h5 className="mb-1">Ver Jugadores en la Liga</h5>
              <p className="mb-1">Mira la lista de jugadores que pertenecen a esta liga.</p>
            </Link>
            <Link to={`/partidas-en-curso/${ligaId}`} className="list-group-item list-group-item-action mb-3">
              <h5 className="mb-1">Ver Todas las Partidas en Curso</h5>
              <p className="mb-1">Revisa las partidas que están actualmente en curso.</p>
            </Link>
          </div>
          <div className="text-center mt-4">
            <Link to="/" className="btn btn-secondary">Volver al Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpcionesLiga;
