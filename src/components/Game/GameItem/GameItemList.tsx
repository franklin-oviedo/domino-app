import React from "react";
import { GameItem } from "./GameItem";
import { Game } from "../../../pages/StartGame";


interface GameListProps {
  games: Game[];
  onJoinGame: (game: Game) => void;
  onDeleteGame: (gameId: string) => void;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  onJoinGame,
  onDeleteGame,
}) => {
  if (games.length === 0) return <p>No hay partidas.</p>;

  return (
    <ul className="list-group">
      {games.map((game) => (
        <GameItem
          key={game.id}
          game={game}
          onJoin={onJoinGame}
          onDelete={onDeleteGame}
        />
      ))}
    </ul>
  );
};
