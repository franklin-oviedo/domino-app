// src/components/Estadisticas.js
import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Table, Nav } from "react-bootstrap";
import { StatiticsTable } from "../components/StatiticsTable";
import { categorizePlayers } from "../helpers/statiticsHelper";

export const Statistics = () => {
  const { leagueId } = useParams();
  const [jugadoresMes, setJugadoresMes] = useState<any[]>([]);

  useEffect(() => {
    const jugadoresRef = ref(database, `ligas/${leagueId}/jugadores`);
    onValue(jugadoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jugadoresList: any[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // Ordenar por average mensual
        const sortedMes = jugadoresList.sort(
          (a, b) => (b.mensual?.average || 0) - (a.mensual?.average || 0)
        );
        const sortedAnual = jugadoresList.sort(
          (a, b) => (b.anual?.average || 0) - (a.anual?.average || 0)
        );
        setJugadoresMes(sortedMes);
      }
    });
  }, [leagueId]);

  const categorizedPlayers = categorizePlayers(jugadoresMes);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Estadísticas de la Liga</h2>
      <Row>
        <Col>
          <StatiticsTable categorizedPlayers={categorizedPlayers} />
          {jugadoresMes.length === 0 && (
            <p className="text-center mt-3">
              No hay estadísticas mensuales disponibles.
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

