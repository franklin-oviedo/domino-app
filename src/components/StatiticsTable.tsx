import { Table } from "react-bootstrap";
import { calculateAverage } from "../helpers/statiticsHelper";
type StatiticsTableProps = {
  categorizedPlayers: any;
};
export const StatiticsTable: React.FC<StatiticsTableProps> = ({
  categorizedPlayers,
}) => {
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
