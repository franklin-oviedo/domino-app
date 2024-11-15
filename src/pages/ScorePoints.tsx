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
  const [puntosInput, setPuntosInput] = useState(0);
  const [equipo, setEquipo] = useState<number>(1);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (!partidaId || !leagueId) return;

    const partidaRef = firebase.database().ref(`ligas/${leagueId}/partidas/${partidaId}`);
    partidaRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPuntosFirstTeam(data.teams.FirstTeam?.[2] || {});
        setPuntosSecondTeam(data.teams.SecondTeam?.[2] || {});
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
      // Si el equipo tiene más puntos que el otro, se define al ganador y perdedor
      const idTeamWinner = equipo === 1 ? "FirstTeam" : "SecondTeam";
      const idTeamLooser = equipo === 1 ? "SecondTeam" : "FirstTeam";

      // Actualizar el estado de la partida a finalizada
      await partidaRef.update({
        ended: true,
        idTeamWinner: idTeamWinner,
        idTeamLooser: idTeamLooser,
      });

      setWinner(equipo === 1 ? "Equipo 1" : "Equipo 2");

      // Actualizar jugadores al finalizar la partida
      const jugadoresRef = firebase.database().ref(`ligas/${leagueId}/jugadores`);
      const jugadores = await jugadoresRef.once("value");
      const jugadoresData = jugadores.val();

      const updateJugadorStats = async (jugadorId: string, ganador: boolean) => {
        const jugadorRef = firebase.database().ref(`ligas/${leagueId}/jugadores/${jugadorId}`);
        const jugadorData = jugadoresData[jugadorId];

        // Actualizar estadísticas de jugadores
        await jugadorRef.update({
          isPlaying: false,
          totalPartidas: jugadorData.totalPartidas + 1,
          partidasGanadas: ganador ? jugadorData.partidasGanadas + 1 : jugadorData.partidasGanadas,
          partidasPerdidas: ganador ? jugadorData.partidasPerdidas : jugadorData.partidasPerdidas + 1,
        });
      };

      // Recorrer todos los jugadores de los equipos para actualizarlos
      for (let jugadorId in jugadoresData) {
        const jugador = jugadoresData[jugadorId];
        if (jugador.isPlaying) {
          const esGanador = (equipo === 1 && idTeamWinner === "FirstTeam") || (equipo === 2 && idTeamWinner === "SecondTeam");
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
              <Card.Title>Equipo 1</Card.Title>
              {/* Aquí puedes agregar los nombres de los jugadores dinámicamente */}
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
              <Card.Title>Equipo 2</Card.Title>
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
          <Button variant="primary" onClick={() => savePoints(puntosInput)}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={winner !== null} onHide={() => setWinner(null)}>
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
