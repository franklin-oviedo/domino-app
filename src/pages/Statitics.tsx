
import { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useParams } from "react-router-dom";
import { Container, Row, Col} from "react-bootstrap";
import { StatiticsTable } from "../components/StatiticsTable";
import { categorizePlayers } from "../helpers/statiticsHelper";

export const Statistics = () => {
  const { leagueId } = useParams();
  const [jugadoresMes, setJugadoresMes] = useState<any[]>([]);
  const [categorizedPlayers, setcategorizedPlayers] = useState<any>([]);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i); // Last 3 years
  const months = [
    { label: 'Todo', value: 0 },
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Augosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 },
  ];
  useEffect(() => {
    const jugadoresRef = ref(database, `ligas/${leagueId}/jugadores`);
    onValue(jugadoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jugadoresList: any[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setJugadoresMes(jugadoresList);
        
      }
    });
  }, [leagueId]);

  useEffect(() => {
    const d = new Date();
    let year = d.getFullYear();
    setcategorizedPlayers(categorizePlayers(jugadoresMes, false, year ,0));
  }, []);
 
  // Handlers for updating the year and month
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(event.target.value));
  };

  // Display selected year and month
  const handleSubmit = () => {
    const isFilteredByMonth = selectedMonth == 0 ? false : true;
    setcategorizedPlayers(categorizePlayers(jugadoresMes, isFilteredByMonth, selectedYear ,selectedMonth));
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Estadísticas de la Liga</h2>
      
      <Container className="mt-3">
        <Row>
          <div className="col-4  col-lg-3" >
          <label>
            Año:
            <select value={selectedYear} onChange={handleYearChange}>
              <option value="">--Select Year--</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          </div>
          <div className="col-4 col-lg-3" >
            <label>
              Mes:
              <select value={selectedMonth} onChange={handleMonthChange}>
                <option value="">--Select Month--</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="col-4 col-lg-3" >
            <button onClick={handleSubmit}>Buscar</button>
          </div>
        </Row>

      </Container>

      <Row>
        <Col>
          <StatiticsTable categorizedPlayers={categorizedPlayers ?? []} />
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

