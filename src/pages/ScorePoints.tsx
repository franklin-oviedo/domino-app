import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Modal, Button, Card, Row, Col, ListGroup } from "react-bootstrap";
import {
  subscribeToGame,
  savePoints,
  endGame,
  updatePlayerStats,
} from "../services/gameService";
import { getPlayers } from "../services/playersService";

interface ScorePointsState {
  partidaId: string;
}

export const ScorePoints: React.FC = () => {
  const { state } = useLocation() as { state: ScorePointsState };
  const { partidaId } = state || {};
  const { leagueId } = useParams<{ leagueId: string }>();

  const [puntosFirstTeam, setPuntosFirstTeam] = useState<
    Record<string, number>
  >({});
  const [puntosSecondTeam, setPuntosSecondTeam] = useState<
    Record<string, number>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [puntosInput, setPuntosInput] = useState(0);
  const [equipo, setEquipo] = useState<number>(1);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (!partidaId || !leagueId) return;

    const unsubscribe = subscribeToGame(leagueId, partidaId, (data) => {
      if (data) {
        setPuntosFirstTeam(data.teams.FirstTeam?.[2] || {});
        setPuntosSecondTeam(data.teams.SecondTeam?.[2] || {});
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [partidaId, leagueId]);

  const handleShowModal = (equipoSeleccionado: number) => {
    setEquipo(equipoSeleccionado);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const calcularTotal = (puntos: Record<string, number>): number => {
    return Object.values(puntos).reduce((total, pts) => total + pts, 0);
  };

  const handleSavePoints = async (points: number) => {
    if (!partidaId || !leagueId) return;

    const teamKey = equipo === 1 ? "FirstTeam" : "SecondTeam";
    const currentPoints = equipo === 1 ? puntosFirstTeam : puntosSecondTeam;

    const newPoints = {
      ...currentPoints,
      [Date.now().toString()]: points,
    };

    const totalPoints = calcularTotal(newPoints);

    await savePoints(leagueId, partidaId, teamKey, newPoints);

    if (totalPoints >= 200) {
      const winnerKey = equipo === 1 ? "FirstTeam" : "SecondTeam";
      const loserKey = equipo === 1 ? "SecondTeam" : "FirstTeam";

      await endGame(leagueId, partidaId, winnerKey, loserKey);
      setWinner(equipo === 1 ? "Equipo 1" : "Equipo 2");

      let jugadores: any;

      getPlayers((data) => {
        jugadores = data.filter((player) => !player.isPlaying);
      });

      for (const jugadorId in jugadores) {
        const jugador = jugadores[jugadorId];
        if (jugador.isPlaying) {
          const isWinner =
            (equipo === 1 && winnerKey === "FirstTeam") ||
            (equipo === 2 && winnerKey === "SecondTeam");
          await updatePlayerStats(leagueId, jugadorId, jugador, isWinner);
        }
      }
    }

    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Pizarra Puntos</h2>
      <Row className="align-items-center">
        {/* Team Cards */}
        {["FirstTeam", "SecondTeam"].map((team, idx) => (
          <Col key={team}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{`Equipo ${idx + 1}`}</Card.Title>
                <Card.Text>
                  Total:{" "}
                  {calcularTotal(
                    idx === 0 ? puntosFirstTeam : puntosSecondTeam
                  )}
                </Card.Text>
                <Button
                  variant="primary"
                  onClick={() => handleShowModal(idx + 1)}
                  disabled={winner !== null}
                >
                  Agregar Puntos
                </Button>
                <ListGroup className="mt-3">
                  {Object.entries(
                    idx === 0 ? puntosFirstTeam : puntosSecondTeam
                  ).map(([key, puntos]) => (
                    <ListGroup.Item key={key}>+{puntos} puntos</ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add Points Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Puntos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="number"
            className="form-control"
            value={puntosInput}
            onChange={(e) =>
              setPuntosInput(
                Math.max(0, Math.min(parseInt(e.target.value, 10) || 0, 200))
              )
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSavePoints(puntosInput)}
          >
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Winner Modal */}
      {winner && (
        <Modal show onHide={() => setWinner(null)}>
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
      )}
    </div>
  );
};
