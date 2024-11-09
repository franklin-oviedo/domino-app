// src/components/Jugadores.js
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, push, onValue, remove, update } from "firebase/database";
import { useParams, Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap'; // Ensure you have react-bootstrap installed

export const Players = () =>  {
  const { leagueId } = useParams();
  const [jugadorName, setJugadorName] = useState('');
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [jugadorEditado, setJugadorEditado] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedJugador, setSelectedJugador] = useState<any>(null);

  useEffect(() => {
    const jugadoresRef = ref(database, `ligas/${leagueId}/jugadores`);
    onValue(jugadoresRef, (snapshot) => {
      const data = snapshot.val();
      const jugadoresList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setJugadores(jugadoresList);
    });
  }, [leagueId]);

  const handleAgregarJugador = () => {
    if (jugadorName.trim() === '') {
      alert("El nombre del jugador no puede estar vacío.");
      return;
    }

    const jugadoresRef = ref(database, `ligas/${leagueId}/jugadores`);
    push(jugadoresRef, {
      name: jugadorName,
      partidasGanadas: 0,
      partidasPerdidas: 0,
      average: 0,
      totalPartidas: 0, // Add total partidas field
    });
    setJugadorName('');
  };

  const handleEliminarJugador = (jugadorId:string) => {
    const jugadorRef = ref(database, `ligas/${leagueId}/jugadores/${jugadorId}`);
    remove(jugadorRef)
      .then(() => {
        console.log("Jugador eliminado con éxito");
      })
      .catch((error) => {
        console.error("Error al eliminar el jugador:", error);
      });
  };

  const handleEditarJugador = (jugador:any) => {
    setJugadorEditado(jugador.id);
    setNuevoNombre(jugador.name);
  };

  const handleGuardarCambios = (jugadorId:string) => {
    if (nuevoNombre.trim() === '') {
      alert("El nuevo nombre no puede estar vacío.");
      return;
    }

    const jugadorRef = ref(database, `ligas/${leagueId}/jugadores/${jugadorId}`);
    update(jugadorRef, { name: nuevoNombre })
      .then(() => {
        console.log("Nombre del jugador actualizado con éxito");
        setJugadorEditado(null);
        setNuevoNombre('');
      })
      .catch((error) => {
        console.error("Error al actualizar el nombre del jugador:", error);
      });
  };

  const handleVerEstadisticas = (jugador:any) => {
    setSelectedJugador(jugador);
    setShowStatsModal(true);
  };

  const handleCloseModal = () => {
    setShowStatsModal(false);
    setSelectedJugador(null);
  };

  return (
    <div>
      <h2>Jugadores en la Liga</h2>
      <div className="input-group mb-3">
        <input 
          type="text" 
          value={jugadorName} 
          onChange={(e) => setJugadorName(e.target.value)} 
          placeholder="Nombre del Jugador" 
          className="form-control" 
        />
        <button onClick={handleAgregarJugador} className="btn btn-primary">Agregar Jugador</button>
      </div>
      
      <div className="row">
        {jugadores.map((jugador) => (
          <div className="col-12 col-md-6 col-lg-4" key={jugador.id}>
            <div className="card mb-3">
              <div className="card-body">
                {jugadorEditado === jugador.id ? (
                  <>
                    <input 
                      type="text" 
                      value={nuevoNombre} 
                      onChange={(e) => setNuevoNombre(e.target.value)} 
                      className="form-control mb-2"
                    />
                    <button 
                      onClick={() => handleGuardarCambios(jugador.id)} 
                      className="btn btn-success"
                    >
                      Guardar Cambios
                    </button>
                  </>
                ) : (
                  <>
                    <h5 className="card-title">{jugador.name}</h5>
                    <div className="d-flex flex-column">
                      <button onClick={() => handleVerEstadisticas(jugador)} className="btn btn-info mb-2">Ver Estadísticas</button>
                      <button onClick={() => handleEditarJugador(jugador)} className="btn btn-warning mb-2">Editar</button>
                      <button onClick={() => handleEliminarJugador(jugador.id)} className="btn btn-danger">Eliminar</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to={`/iniciar-partida/${leagueId}`} className="btn btn-success mt-4">Iniciar Partida</Link>
      <Link to="/" className="btn btn-secondary mt-4">Volver al Home</Link>

      {/* Modal for player statistics */}
      <Modal show={showStatsModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Estadísticas de {selectedJugador?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Estadísticas del Mes</h5>
          <table className="table">
            <thead>
              <tr>
                <th>Partidas Totales</th> {/* Moved Total Games to the top */}
                <th>Partidas Ganadas</th>
                <th>Partidas Perdidas</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedJugador?.totalPartidas}</td> {/* Display Total Games */}
                <td>{selectedJugador?.partidasGanadas}</td>
                <td>{selectedJugador?.partidasPerdidas}</td>
                <td>{selectedJugador?.average}</td>
              </tr>
            </tbody>
          </table>

          <h5>Estadísticas Anuales</h5>
          <table className="table">
            <thead>
              <tr>
                <th>Partidas Totales</th> {/* Moved Total Games to the top */}
                <th>Partidas Ganadas</th>
                <th>Partidas Perdidas</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedJugador?.totalPartidas}</td> {/* Display Total Games */}
                <td>{selectedJugador?.partidasGanadas}</td>
                <td>{selectedJugador?.partidasPerdidas}</td>
                <td>{selectedJugador?.average}</td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    </div>
  );
}

