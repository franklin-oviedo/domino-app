import { useParams, Link } from "react-router-dom";
import { ROUTE_PATHS } from "../helpers/routes";

export const LeagueOptions = () => {
  const { leagueId } = useParams();

  const options = [
    {
      path: ROUTE_PATHS.START_GAME.replace(":leagueId", leagueId!),
      title: "Iniciar Partida",
      description: "Comienza una nueva partida en esta liga.",
    },
    {
      path: ROUTE_PATHS.STATISTICS.replace(":leagueId", leagueId!),
      title: "Ver Estadísticas de Todos los Jugadores",
      description:
        "Consulta las estadísticas de rendimiento de todos los jugadores.",
    },
    {
      path: ROUTE_PATHS.PLAYERS.replace(":leagueId", leagueId!),
      title: "Ver Jugadores en la Liga",
      description: "Mira la lista de jugadores que pertenecen a esta liga.",
    },
  ];

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="list-group">
            {options.map((option, index) => (
              <Link
                key={index}
                to={option.path}
                className="list-group-item list-group-item-action mb-3"
              >
                <h5 className="mb-1">{option.title}</h5>
                <p className="mb-1">{option.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/" className="btn btn-secondary">
              Volver al Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
