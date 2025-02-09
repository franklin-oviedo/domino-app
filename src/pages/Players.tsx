import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, push, onValue, remove, update } from "firebase/database";
import { useParams, Link } from "react-router-dom";
import { Modal } from "react-bootstrap";

export const Players = () => {
  const { leagueId } = useParams();
  const [jugadorName, setJugadorName] = useState("");
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [jugadorEditado, setJugadorEditado] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedJugador, setSelectedJugador] = useState<any>(null);

  useEffect(() => {
    const jugadoresRef = ref(database, `ligas/${leagueId}/jugadores`);
    onValue(jugadoresRef, (snapshot) => {
      const data = snapshot.val();
      const jugadoresList = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setJugadores(jugadoresList);
    });
  }, [leagueId]);

  const handleAgregarJugador = () => {
    if (!nameValidations()) return;

    const jugadoresRef = ref(database, `ligas/${leagueId}/jugadores`);
    const currentYear = new Date().getFullYear();
    const currentMonth = parseInt(new Date().toLocaleString('es-ES', { month: 'numeric' }));

    const statics = {
      [currentYear]: Array(12).fill(null)
    };

    statics[currentYear][currentMonth] = {
      Ganadas: 0,
      Perdidas: 0
    };
    push(jugadoresRef, {
      name: jugadorName,
      isPlaying: false,
      statics: statics
    });
    setJugadorName("");
  };

  const handleEliminarJugador = (jugadorId: string) => {
    const jugadorRef = ref(
      database,
      `ligas/${leagueId}/jugadores/${jugadorId}`
    );
    remove(jugadorRef)
      .then(() => {
        console.log("Jugador eliminado con éxito");
      })
      .catch((error) => {
        console.error("Error al eliminar el jugador:", error);
      });
  };

  const handleEditarJugador = (jugador: any) => {
    setJugadorEditado(jugador.id);
    setNuevoNombre(jugador.name);
  };

  const handleGuardarCambios = (jugadorId: string) => {
    if (!nameValidations()) return;

    const jugadorRef = ref(database, `ligas/${leagueId}/jugadores/${jugadorId}`);
    update(jugadorRef, { name: nuevoNombre })
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
    let format = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/;
    let isValid = true;
    if (jugadorName.trim() === '') {
      alert("El nuevo nombre no puede estar vacío.");
      isValid = false;
    } else if (jugadorName.length > 1 && jugadorName.length <= 3) {
      alert("El nuevo nombre debe tener mas de 3 caracteres.");
      isValid = false;
    } else if (format.test(jugadorName)) {
      alert("Los caracteres especiales no son permitidos.");
      isValid = false;
    }
    return isValid;
  };

  const handleVerEstadisticas = (jugador: any) => {
    const statics = jugador.statics;
    let totalPartidas = 0;
    let partidasGanadas = 0;
    let partidasPerdidas = 0;
    let averagePorMes = 0;
    let averagePorAno = 0;

    for (const year in statics) {
      for (const month in statics[year]) {
        const monthData = statics[year][month];
        if (monthData) {
          partidasGanadas += monthData.Ganadas;
          partidasPerdidas += monthData.Perdidas;
        }
      }
    }

    totalPartidas = partidasGanadas + partidasPerdidas;
    averagePorMes = totalPartidas > 0 ? (partidasGanadas / totalPartidas) : 0;
    averagePorAno = totalPartidas > 0 ? (partidasGanadas / totalPartidas) : 0;

    setSelectedJugador({
      ...jugador,
      totalPartidas,
      partidasGanadas,
      partidasPerdidas,
      averagePorMes: averagePorMes.toFixed(3),
      averagePorAno: averagePorAno.toFixed(3),
    });
    setShowStatsModal(true);
  };

  const handleCloseModal = () => {
    setShowStatsModal(false);
    setSelectedJugador(null);
  };

  const getCurrentMonthName = () => {
    return new Date().toLocaleString('es-ES', { month: 'long' });
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <div>
      <div className="input-group mb-3">
        <input
          type="text"
          value={jugadorName}
          onChange={(e) => setJugadorName(e.target.value)}
          placeholder="Agregar jugador nuevo - Nombre del Jugador"
          className="form-control"
        />
        <button title='Agregar jugador nuevo' onClick={handleAgregarJugador} className="btn btn-primary"><i className="bi bi-person-plus-fill fs-4"></i></button>
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
                      placeholder='text'
                    />
                    <button
                      title='Guardar cambios'
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
                      <button title='Ver Estadísticas' onClick={() => handleVerEstadisticas(jugador)} className="btn btn-info mb-2"><i className="bi bi-table fs-6"></i></button>
                      <button title='Editar' onClick={() => handleEditarJugador(jugador)} className="btn btn-warning mb-2"><i className="bi bi-pencil-square fs-6"></i></button>
                      <button title='Eliminar' onClick={() => handleEliminarJugador(jugador.id)} className="btn btn-danger"><i className="bi bi-trash3 fs-6"></i></button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to={`/start-game/${leagueId}`} className="btn btn-success mt-4"><i className="bi bi-play fs-4"></i></Link>
      <Link to="/" className="btn btn-info mt-4"><i className="bi bi-house fs-4"></i></Link>
      <Modal show={showStatsModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Estadísticas de {selectedJugador?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Estadísticas de {getCurrentMonthName()}</h5>
          <table className="table">
            <thead>
              <tr>
                <th>Partidas Totales</th>
                <th>Partidas Ganadas</th>
                <th>Partidas Perdidas</th>
                <th>Average por Mes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedJugador?.totalPartidas}</td>
                <td>{selectedJugador?.partidasGanadas}</td>
                <td>{selectedJugador?.partidasPerdidas}</td>
                <td>{selectedJugador?.averagePorMes}</td>
              </tr>
            </tbody>
          </table>

          <h5>Estadísticas del Año {getCurrentYear()}</h5>
          <table className="table">
            <thead>
              <tr>
                <th>Partidas Totales</th>
                <th>Partidas Ganadas</th>
                <th>Partidas Perdidas</th>
                <th>Average por Año</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedJugador?.totalPartidas}</td>
                <td>{selectedJugador?.partidasGanadas}</td>
                <td>{selectedJugador?.partidasPerdidas}</td>
                <td>{selectedJugador?.averagePorAno}</td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    </div>
  );
};