import React from "react";
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
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
      {/* {`Partida ID: ${game.id} - Jugadores: ${game.jugadores.join(" - ")}`} */}
      <div>
        <button
          title="Ver partida en curso"
          className="btn btn-info btn-sm me-2"
          onClick={() => onJoin(game)}
        >
          <i className="bi bi-eye fs-6"></i>
        </button>
        <button
          title="Borrar"
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(game.id)}
        >
          <i className="bi bi-trash3 fs-6"></i>
        </button>
      </div>
    </li>
  );
};
