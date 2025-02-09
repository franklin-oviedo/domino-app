import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Modal, Button, Card, Row, Col, ListGroup } from "react-bootstrap";
import firebase from "firebase/compat/app";
import "firebase/compat/database";

interface ScorePointsState {
  partidaId: string;
}

export const ScorePoints: React.FC = () => {
  const { state } = useLocation() as { state: ScorePointsState };
  const { partidaId } = state || {};
  const { leagueId } = useParams<{ leagueId: string }>();

  const [puntosFirstTeam, setPuntosFirstTeam] = useState<Record<string, number>>({});
  const [puntosSecondTeam, setPuntosSecondTeam] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [puntosInput, setPuntosInput] = useState<number>();
  const [equipo, setEquipo] = useState<number>(1);
  const [winner, setWinner] = useState<string | null>(null);
  const [firstTeamNames, setFirstTeamNames] = useState<string[]>([]);
  const [secondTeamNames, setSecondTeamNames] = useState<string[]>([]);

  useEffect(() => {
    if (!partidaId || !leagueId) return;

    const partidaRef = firebase.database().ref(`ligas/${leagueId}/partidas/${partidaId}`);
    partidaRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPuntosFirstTeam(data.teams.FirstTeam?.[2] || {});
        setPuntosSecondTeam(data.teams.SecondTeam?.[2] || {});
        setFirstTeamNames(data.teams.FirstTeam.map((player: any) => player.name));
        setSecondTeamNames(data.teams.SecondTeam.map((player: any) => player.name));
      }
    });

    return () => partidaRef.off();
  }, [partidaId, leagueId]);

  const handleShowModal = (equipoSeleccionado: number) => {
    setEquipo(equipoSeleccionado);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const calcularTotal = (puntos: Record<string, number>): number => {
    return Object.values(puntos).reduce((total, pts) => total + pts, 0);
  };

  const savePoints = async (points: number) => {
    if (!partidaId || !leagueId) return;

    const partidaRef = firebase.database().ref(`ligas/${leagueId}/partidas/${partidaId}`);

    const puntosKey = Date.now().toString();

    const teamKey = equipo === 1 ? "FirstTeam" : "SecondTeam";
    const currentPoints = equipo === 1 ? puntosFirstTeam : puntosSecondTeam;

    const newPoints = {
      ...currentPoints,
      [puntosKey]: points,
    };

    const totalPoints = calcularTotal(newPoints);

    // Actualizar la posición 3 en el equipo seleccionado
    await partidaRef.update({
      [`teams/${teamKey}/2`]: newPoints,
    });

    // Verificar si el total de puntos ha superado el umbral para finalizar la partida
    if (totalPoints >= 200) {
      // Calcular el total de puntos de ambos equipos
      const totalFirstTeam = calcularTotal({
        ...puntosFirstTeam,
        ...(equipo === 1 ? { [puntosKey]: points } : {}),
      });
      const totalSecondTeam = calcularTotal({
        ...puntosSecondTeam,
        ...(equipo === 2 ? { [puntosKey]: points } : {}),
      });

      // Determinar el equipo ganador y perdedor
      const idTeamWinner = totalFirstTeam > totalSecondTeam ? "FirstTeam" : "SecondTeam";
      const idTeamLooser = totalFirstTeam > totalSecondTeam ? "SecondTeam" : "FirstTeam";

      // Actualizar el estado de la partida a finalizada
      await partidaRef.update({
        ended: true,
        idTeamWinner: idTeamWinner,
        idTeamLooser: idTeamLooser,
      });

      setWinner(idTeamWinner);

      // Actualizar jugadores al finalizar la partida
      const jugadoresRef = firebase.database().ref(`ligas/${leagueId}/jugadores`);
      const jugadores = await jugadoresRef.once("value");
      const jugadoresData = jugadores.val();

      const partidaTeams = await partidaRef.once("value");
      const teams = partidaTeams.val();

      const currentYear = new Date().getFullYear();
      const currentMonth = parseInt(new Date().toLocaleString('es-ES', { month: 'numeric' }));

      const updateJugadorStats = async (jugadorId: string, ganador: boolean) => {
        const jugadorRef = firebase.database().ref(`ligas/${leagueId}/jugadores/${jugadorId}`);
        const jugadorData = jugadoresData[jugadorId];

        // Create an array with 12 elements, initializing each month with null
        const statics = jugadorData.statics || {
          [currentYear]: Array(12).fill(null)
        };

        // Ensure the current year is initialized
        if (!statics[currentYear]) {
          statics[currentYear] = Array(12).fill(null);
        }

        // Initialize the current month with an object containing "Ganadas" and "Perdidas" set to 0 if not already initialized
        if (!statics[currentYear][currentMonth]) {
          statics[currentYear][currentMonth] = {
            Ganadas: 0,
            Perdidas: 0
          };
        }

        // Update the current month's statistics
        if (ganador) {
          statics[currentYear][currentMonth].Ganadas += 1;
        } else {
          statics[currentYear][currentMonth].Perdidas += 1;
        }

        // Actualizar estadísticas de jugadores
        await jugadorRef.update({
          isPlaying: false,
          statics: statics
        });
      };

      // Recorrer todos los jugadores de los equipos para actualizarlos
      for (let jugadorId in jugadoresData) {
        const jugador = jugadoresData[jugadorId];
        if (jugador.isPlaying) {
          const esGanador = teams.teams.FirstTeam.some((player: any) => player.id === jugadorId) ? idTeamWinner === "FirstTeam" : idTeamWinner === "SecondTeam";
          await updateJugadorStats(jugadorId, esGanador);
        }
      }
    }

    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Pizarra Puntos</h2>
      <Row className="align-items-center">
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>{firstTeamNames.join(" & ")}</Card.Title>
              <Card.Text>Total: {calcularTotal(puntosFirstTeam)}</Card.Text>
              <Button
                variant="primary"
                onClick={() => handleShowModal(1)}
                disabled={winner !== null}
              >
                Agregar Puntos
              </Button>
              <ListGroup className="mt-3">
                {Object.entries(puntosFirstTeam).map(([key, puntos]) => (
                  <ListGroup.Item key={key}>+{puntos} puntos</ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col className="text-center">
          <h2 className="my-4">VS</h2>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>{secondTeamNames.join(" & ")}</Card.Title>
              <Card.Text>Total: {calcularTotal(puntosSecondTeam)}</Card.Text>
              <Button
                variant="primary"
                onClick={() => handleShowModal(2)}
                disabled={winner !== null}
              >
                Agregar Puntos
              </Button>
              <ListGroup className="mt-3">
                {Object.entries(puntosSecondTeam).map(([key, puntos]) => (
                  <ListGroup.Item key={key}>+{puntos} puntos</ListGroup.Item>
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
          <Button variant="primary" onClick={() => savePoints(puntosInput || 0)}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={winner !== null} onHide={() => setWinner(winner)}>
        <Modal.Header closeButton>
          <Modal.Title>¡Fin de la Partida!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Ganador: {winner}</h3>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setWinner(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};