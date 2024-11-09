// src/components/Estadisticas.js
import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Table, Nav } from "react-bootstrap";

function Estadisticas() {
  const { ligaId } = useParams();
  const [jugadoresMes, setJugadoresMes] = useState<any[]>([]);
  const [jugadoresAnual, setJugadoresAnual] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("mes");

  useEffect(() => {
    const jugadoresRef = ref(database, `ligas/${ligaId}/jugadores`);
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
        setJugadoresAnual(sortedAnual);
      }
    });
  }, [ligaId]);

  const renderCategory = (categoryName: string, players: any[]) => (
    <>
      <tr className={`bg-light-blue text-white`}>
        <th colSpan={4} className="text-center">
          {categoryName}
        </th>
      </tr>
      {players.map((jugador) => (
        <tr key={jugador.id}>
          <td>{jugador.name}</td>
          <td>{jugador.mensual?.partidasGanadas || 0}</td>
          <td>{jugador.mensual?.partidasPerdidas || 0}</td>
          <td>{calculateAverage(jugador.mensual)}</td>
        </tr>
      ))}
    </>
  );

  const calculateAverage = (stats: any) => {
    const ganadas = stats?.partidasGanadas || 0;
    const perdidas = stats?.partidasPerdidas || 0;
    const totalPartidas = ganadas + perdidas;
    if (totalPartidas > 0) {
      return (ganadas / totalPartidas).toFixed(2);
    } else {
      return "-";
    }
  };

  const categorizePlayers = (players: any[]) => {
    const legendarios = players.slice(0, 4);
    const veteranos = players.slice(4, 8);
    const pro = players.slice(8, 12);
    const rikili = players.slice(12);

    return { legendarios, veteranos, pro, rikili };
  };

  const categorizedPlayers = categorizePlayers(jugadoresMes);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Estadísticas de la Liga</h2>
      <Row>
        <Col>
          {activeTab === "mes" && (
            <Table striped bordered hover responsive className="mt-3">
              <thead className="bg-primary text-white">
                <tr>
                  <th>Nombre</th>
                  <th>Partidas Ganadas</th>
                  <th>Partidas Perdidas</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {renderCategory("Legendarios", categorizedPlayers.legendarios)}
                {renderCategory("Veteranos", categorizedPlayers.veteranos)}
                {renderCategory("Pro", categorizedPlayers.pro)}
                {renderCategory("Rikili", categorizedPlayers.rikili)}
              </tbody>
            </Table>
          )}
          {jugadoresMes.length === 0 && activeTab === "mes" && (
            <p className="text-center mt-3">
              No hay estadísticas mensuales disponibles.
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Estadisticas;
