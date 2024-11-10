import React from "react";

interface Player {
  id: string;
  name: string;
}

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  onClick: (player: Player) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isSelected, onClick }) => {
  return (
    <div className="col-12 col-md-6 col-lg-3">
      <div
        className={`card mb-2 ${isSelected ? "border-primary" : ""}`}
        onClick={() => onClick(player)}
      >
        <div className="card-body text-center">
          <i className="bi bi-person fs-2"></i>
          <h5 className="card-title">{player.name}</h5>
        </div>
      </div>
    </div>
  );
};
