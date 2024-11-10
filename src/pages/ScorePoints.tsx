import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  ListGroup,
  Alert,
} from "react-bootstrap";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { database } from "../firebase";

export const ScorePoints = () => {
  const { state } = useLocation();
  const { jugadores, partidaId } = state || { jugadores: [] };
  const navigate = useNavigate();
  const { leagueId } = useParams();

  const [puntosEquipo1, setPuntosEquipo1] = useState<any>({});
  const [puntosEquipo2, setPuntosEquipo2] = useState<any>({});
  const [historialEquipo1, setHistorialEquipo1] = useState<any[]>([]);
  const [historialEquipo2, setHistorialEquipo2] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [puntosInput, setPuntosInput] = useState(0);
  const [equipo, setEquipo] = useState(1);
  const [isFinalized, setIsFinalized] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerPlayers, setWinnerPlayers] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!partidaId) return;

    const partidaRef = firebase.database().ref(`partidas/${partidaId}`);
    partidaRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPuntosEquipo1(data.puntosEquipo1 || {});
        setPuntosEquipo2(data.puntosEquipo2 || {});
        setHistorialEquipo1(data.historialEquipo1 || []);
        setHistorialEquipo2(data.historialEquipo2 || []);
        setIsFinalized(data.finalizado || false);
      }
    });

    return () => partidaRef.off();
  }, [partidaId]);

  const handleShowModal = (equipoSeleccionado: any) => {
    setEquipo(equipoSeleccionado);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleAgregarPuntos = useCallback(() => {
    if (puntosInput <= 0 || puntosInput > 200) {
      setError("Los puntos deben estar entre 1 y 200");
      return;
    }

    const newPuntos = { [new Date().getTime()]: puntosInput };

    const actualizarEquipo = (equipo: any) => {
      const puntos = equipo === 1 ? puntosEquipo1 : puntosEquipo2;

      const updatedPuntos = { ...puntos, ...newPuntos };
      const nuevoRegistro = {
        puntos: puntosInput,
        timestamp: new Date().toLocaleString(),
      };

      const total: any = calcularTotal(updatedPuntos);
      if (total >= 200) {
        finalizarPartida(
          `Equipo ${equipo}`,
          jugadores.slice((equipo - 1) * 2, equipo * 2),
          jugadores.slice(equipo * 2)
        );
      }

      return updatedPuntos;
    };

    if (equipo === 1) {
      setPuntosEquipo1(actualizarEquipo(1));
      savePoints(partidaId!, 1, actualizarEquipo(1));
      setHistorialEquipo1((prev) => {
        const nuevoRegistro = {
          puntos: puntosInput,
          timestamp: new Date().toLocaleString(),
        };
        return prev.some(
          (registro) =>
            registro.puntos === nuevoRegistro.puntos &&
            registro.timestamp === nuevoRegistro.timestamp
        )
          ? prev
          : [...prev, nuevoRegistro];
      });
    } else {
      // savePoints(partidaId!, 2, actualizarEquipo(2));

      setPuntosEquipo2(actualizarEquipo(2));
      setHistorialEquipo2((prev) => {
        const nuevoRegistro = {
          puntos: puntosInput,
          timestamp: new Date().toLocaleString(),
        };
        return prev.some(
          (registro) =>
            registro.puntos === nuevoRegistro.puntos &&
            registro.timestamp === nuevoRegistro.timestamp
        )
          ? prev
          : [...prev, nuevoRegistro];
      });
    }

    // setPuntosInput(0);
    handleCloseModal();
    setError(""); // Limpiar el mensaje de error
  }, [puntosInput, equipo, jugadores, partidaId]);

  const finalizarPartida = (
    winningTeam: any,
    winningPlayers: any,
    losingPlayers: any
  ) => {
    setIsFinalized(true);
    setWinner(winningTeam);
    setWinnerPlayers(winningPlayers);

    const partidaRef = firebase.database().ref(`partidas/${partidaId}`);
    partidaRef.once("value").then((snapshot) => {
      const partidaData = snapshot.val();
      const datosFinales = {
        ...partidaData,
        finalizado: true,
        ganador: winningTeam,
        fecha: new Date().toISOString(),
        jugadoresGanadores: winningPlayers.map((jugador: any) => ({
          id: jugador.id,
          name: jugador.name,
        })),
        jugadoresPerdedores: losingPlayers.map((jugador: any) => ({
          id: jugador.id,
          name: jugador.name,
        })),
      };

      // Actualiza el campo 'finalizado' y 'ganador' en la partida
      partidaRef
        .update({ finalizado: true, ganador: winningTeam })
        .then(() => {
          // Luego, guarda la partida finalizada en "partidasJugadas"
          const partidasJugadasRef = firebase
            .database()
            .ref("partidasJugadas/");
          return partidasJugadasRef.push(datosFinales);
        })
        .then(() => {
          // Finalmente, elimina la partida de "partidas"
          return partidaRef.remove();
        })
        .catch((error) =>
          console.error("Error al finalizar la partida:", error)
        );
    });
  };

  const iniciarNuevaPartida = () => {
    const nuevaPartidaRef = firebase.database().ref("partidas/").push();
    nuevaPartidaRef
      .set({
        puntosEquipo1: {},
        puntosEquipo2: {},
        historialEquipo1: [],
        historialEquipo2: [],
        finalizado: false,
        jugadores,
      })
      .then(() => {
        navigate(`/anotar-puntos/${nuevaPartidaRef.key}`, {
          state: { jugadores },
        });
      })
      .catch((error) =>
        console.error("Error al iniciar nueva partida:", error)
      );
  };

  const calcularTotal = (puntos: number[]) => {
    return Object.values(puntos).reduce((total, pts) => total + pts, 0);
  };

  const savePoints = (partidaId: string, teamNumberId = 1, points = 0) => {
    let teamId = teamNumberId == 1 ? "FirstTeam" : "SecondTeam";
    const ref = database.ref(
      `ligas/${leagueId}/partidas/${partidaId}/teams/${teamId}`
    );

    ref.push(points);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Anotar Puntos</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="align-items-center">
        <Col>
          <Card className={`mb-3 ${isFinalized ? "bg-danger text-white" : ""}`}>
            <Card.Body>
              <Card.Title>
                Equipo 1:{" "}
                {/* {jugadores
                  .slice(0, 2)
                  .map((j: any) => j.name)
                  .join(" - ")} */}
              </Card.Title>
              <Card.Text>Total: {calcularTotal(puntosEquipo1)}</Card.Text>
              <Button
                variant="primary"
                onClick={() => handleShowModal(1)}
                disabled={isFinalized}
              >
                Agregar Puntos
              </Button>
              <ListGroup className="mt-3">
                {historialEquipo1.map((registro, index) => (
                  <ListGroup.Item key={index}>
                    +{registro.puntos} puntos ({registro.timestamp})
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col className="text-center">
          <h2 className="my-4">VS</h2>
        </Col>

        <Col>
          <Card className={`mb-3 ${isFinalized ? "bg-danger text-white" : ""}`}>
            <Card.Body>
              <Card.Title>
                Equipo 2:{" "}
                {/* {jugadores
                  .slice(2)
                  .map((j: any) => j.name)
                  .join(" - ")} */}
              </Card.Title>
              <Card.Text>Total: {calcularTotal(puntosEquipo2)}</Card.Text>
              <Button
                variant="primary"
                onClick={() => handleShowModal(2)}
                disabled={isFinalized}
              >
                Agregar Puntos
              </Button>
              <ListGroup className="mt-3">
                {historialEquipo2.map((registro, index) => (
                  <ListGroup.Item key={index}>
                    +{registro.puntos} puntos ({registro.timestamp})
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Puntos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="puntosInput" className="form-label">
              Puntos a agregar:
            </label>
            <input
              type="number"
              id="puntosInput"
              className="form-control"
              value={puntosInput}
              onChange={(e) =>
                setPuntosInput(
                  Math.max(0, Math.min(parseInt(e.target.value, 10) || 0, 200))
                )
              }
              min="0"
              max="200"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAgregarPuntos}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={winner !== null} onHide={() => setWinner(null)}>
        <Modal.Header closeButton>
          <Modal.Title>¡Fin de la Partida!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{winner} ha ganado la partida.</h5>
          <h6>Jugadores ganadores:</h6>
          <ul>
            {winnerPlayers.map((jugador) => (
              <li key={jugador.id}>{jugador.name}</li>
            ))}
          </ul>
          <Button variant="primary" onClick={iniciarNuevaPartida}>
            Iniciar Nueva Partida
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setWinner(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {isFinalized && (
        <h3 className="text-danger text-center mt-4">
          ¡La partida ha finalizado!
        </h3>
      )}
    </div>
  );
};
