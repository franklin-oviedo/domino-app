import React from "react";
import { PlayerCard } from "../PlayerCard";

interface Player {
  id: string;
  name: string;
}

interface GameSelectionProps {
  players: Player[];
  selectedPlayers: Player[];
  onPlayerSelect: (player: Player) => void;
  onStartGame: () => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({
  players,
  selectedPlayers,
  onPlayerSelect,
  onStartGame,
}) => {
    
  return (
    <div>
      <h4>Selecciona 4 jugadores para iniciar la partida</h4>
      <div className="row">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isSelected={selectedPlayers.some((p) => p.id === player.id)}
            onClick={onPlayerSelect}
          />
        ))}
      </div>

      {selectedPlayers.length === 4 && (
        <div className="mt-4">
          <button title="Iniciar partida" className="btn btn-success" onClick={onStartGame}>
          <i className="bi bi-play fs-4"></i>
          </button>
        </div>
      )}
    </div>
  );
};

