// src/components/Jugadores.js
import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, push, onValue, remove, update } from "firebase/database";
import { useParams, Link } from "react-router-dom";
import { Modal } from "react-bootstrap"; // Ensure you have react-bootstrap installed
import { ROUTE_PATHS } from "../helpers/routes";
import {
  addPlayer,
  changeName,
  getPlayers,
  removePlayer,
} from "../services/playersService";
import { SessionStorageKeys } from "../constants/sessionStorageKeys";

export const Players = () => {
  const { leagueId } = useParams();
  const [playerName, setPlayerName] = useState("");
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [jugadorEditado, setJugadorEditado] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedJugador, setSelectedJugador] = useState<any>(null);

  useEffect(() => {
    const leaguePlayers = getPlayers((playersList) => {
      setJugadores(playersList);
    });

    return () => leaguePlayers();
  }, [leagueId]);

  const handleAgregarJugador = () => {
    if (!nameValidations()) return;
    addPlayer(playerName);
    setPlayerName("");
  };

  const handleEliminarJugador = (playerId: string) => {
    removePlayer(playerId);
  };

  const handleEditarJugador = (jugador: any) => {
    setJugadorEditado(jugador.id);
    setNuevoNombre(jugador.name);
  };

  const handleGuardarCambios = async (playerId: string) => {
    if (!nameValidations()) return;
    await changeName(nuevoNombre, playerId)
      .then(() => {
        console.log("Nombre del jugador actualizado con éxito");
        setJugadorEditado(null);
        setNuevoNombre("");
      })
      .catch((error) => {
        console.error("Error al actualizar el nombre del jugador:", error);
      });
  };

  const nameValidations = () => {
    let format = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    let isValid = true;
    if (playerName.trim() === "") {
      alert("El nuevo nombre no puede estar vacío.");
      isValid = false;
    } else if (playerName.length > 1 && playerName.length <= 3) {
      alert("El nuevo nombre debe tener mas de 3 caracteres.");
      isValid = false;
    } else if (format.test(playerName)) {
      alert("Los caracteres especiales no son permitidos.");
      isValid = false;
    }

    return isValid;
  };

  const handleVerEstadisticas = (jugador: any) => {
    setSelectedJugador(jugador);
    setShowStatsModal(true);
  };

  const handleCloseModal = () => {
    setShowStatsModal(false);
    setSelectedJugador(null);
  };

  return (
    <div>
      <div className="input-group mb-3">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Agregar jugador nuevo - Nombre del Jugador"
          className="form-control"
        />
        <button
          title="Agregar jugador nuevo"
          onClick={handleAgregarJugador}
          className="btn btn-primary"
        >
          <i className="bi bi-person-plus-fill fs-4"></i>
        </button>
      </div>
      <h2>Jugadores en la Liga</h2>

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
                      placeholder="text"
                    />
                    <button
                      title="Guardar cambios"
                      onClick={() => handleGuardarCambios(jugador.id)}
                      className="btn btn-success"
                    >
                      <i className="bi bi-save2 fs-5"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <h5 className="card-title">{jugador.name}</h5>
                    <div className="d-flex flex-column">
                      <button
                        title="Ver Estadísticas"
                        onClick={() => handleVerEstadisticas(jugador)}
                        className="btn btn-info mb-2"
                      >
                        <i className="bi bi-table fs-6"></i>
                      </button>
                      <button
                        title="Editar"
                        onClick={() => handleEditarJugador(jugador)}
                        className="btn btn-warning mb-2"
                      >
                        <i className="bi bi-pencil-square fs-6"></i>
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => handleEliminarJugador(jugador.id)}
                        className="btn btn-danger"
                      >
                        <i className="bi bi-trash3 fs-6"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to={`/start-game/${leagueId}`} className="btn btn-success mt-4">
        <i className="bi bi-play fs-4"></i>
      </Link>
      <Link to="/" className="btn btn-info mt-4">
        <i className="bi bi-house fs-4"></i>
      </Link>

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
                <td>{selectedJugador?.totalPartidas}</td>{" "}
                {/* Display Total Games */}
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
                <td>{selectedJugador?.totalPartidas}</td>{" "}
                {/* Display Total Games */}
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
};
