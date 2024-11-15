import React, { useEffect } from "react";
import { Game } from "../../../pages/StartGame";

interface GameItemProps {
  game: Game;
  onJoin: (game: Game) => void;
  onDelete: (gameId: string) => void;
}

export const GameItem: React.FC<GameItemProps> = ({
  game,
  onJoin,
  onDelete,
}) => {
  useEffect(() => {
    console.log(game);
  }, [game]);

  const team1 = game.teams?.FirstTeam?.map((x) => x.name).filter(Boolean).join(" & ");
  const team2 = game.teams?.SecondTeam?.map((x) => x.name).filter(Boolean).join(" & ");

  // Verifica si la partida está en curso (por ejemplo, si `ended` es false)
  const isGameInProgress = game.ended === false;

  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
      <span>
        {team1} <b>vs</b> {team2}
      </span>
      <div>
        <button
          title="Ver partida en curso"
          className="btn btn-info btn-sm me-2"
          onClick={() => onJoin(game)}
        >
          <i className="bi bi-eye fs-6"></i>
        </button>
        
        {/* Mostrar el botón de eliminar solo si la partida está en curso */}
        {isGameInProgress && (
          <button
            title="Borrar"
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(game.id)}
          >
            <i className="bi bi-trash3 fs-6"></i>
          </button>
        )}
      </div>
    </li>
  );
};
