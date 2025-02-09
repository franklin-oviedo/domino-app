import { Table } from "react-bootstrap";
import { calculateAverage } from "../helpers/statiticsHelper";

type StatiticsTableProps = {
  categorizedPlayers: any;
};

export const StatiticsTable: React.FC<StatiticsTableProps> = ({
  categorizedPlayers,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = parseInt(new Date().toLocaleString('es-ES', { month: 'numeric' }));
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
          <td>{jugador.statics?.[currentYear]?.[currentMonth]?.Ganadas || 0}</td>
          <td>{jugador.statics?.[currentYear]?.[currentMonth]?.Perdidas || 0}</td>
          <td>{calculateAverage(jugador.statics?.[currentYear]?.[currentMonth])}</td>
        </tr>
      ))}
    </> 
  );

  return (
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
  );
};