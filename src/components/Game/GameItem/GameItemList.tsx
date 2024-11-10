import React, { useEffect } from "react";
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
  useEffect(()=>{
    console.log(games);
    
  },[])
  if (games.length === 0) return <p>No hay partidas.</p>;

  return (
    <ul className="list-group">
      {games.map((game,index) => (
        <GameItem
          key={game.id+index}
          game={game}
          onJoin={onJoinGame}
          onDelete={onDeleteGame}
        />
      ))}
    </ul>
  );
};
