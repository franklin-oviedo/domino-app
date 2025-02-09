import { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { StatiticsTable } from "../components/StatiticsTable";
import { categorizePlayers } from "../helpers/statiticsHelper";

export const Statistics = () => {
  const { leagueId } = useParams();
  const [jugadores, setJugadores] = useState<any[]>([]);

  useEffect(() => {
    const jugadoresRef = ref(database, `ligas/${leagueId}/jugadores`);
    onValue(jugadoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jugadoresList: any[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setJugadores(jugadoresList);
      }
    });
  }, [leagueId]);

  const categorizedPlayers = categorizePlayers(jugadores);

  const getCurrentMonthName = () => {
    const monthName =  new Date().toLocaleString('es-ES', { month: 'long' });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Estadísticas de la Liga - {getCurrentMonthName()}</h2>
      <Row>
        <Col>
          <StatiticsTable categorizedPlayers={categorizedPlayers} />
          {jugadores.length === 0 && (
            <p className="text-center mt-3">
              No hay estadísticas disponibles.
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
};