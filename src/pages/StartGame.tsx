import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameList } from "../components/Game/GameItem/GameItemList";
import { GameSelection } from "../components/Game/GameSelection";
import { ROUTE_PATHS } from "../helpers/routes";
import {
  subscribeToGames,
  removeGame,
  startGame,
  updatePlayerStatus,
} from "../services/gameService";
import { getPlayers } from "../services/playersService";

interface Player {
  id: string;
  name: string;
  isPlaying?: any;
}

export interface Game {
  date: string;
  ended: boolean;
  id: string;
  idTeamLooser: string;
  idTeamWinner: string;
  teams?: {
    FirstTeam: Player[];
    SecondTeam: Player[];
  };
}

const StartGame: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [ongoingGames, setOngoingGames] = useState<Game[]>([]);
  const [finishedGames, setFinishedGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!leagueId) return;

    const unsubscribePlayers = getPlayers((data) => {
      setPlayers(data.filter((player) => !player.isPlaying));
    });

    const unsubscribeGames = subscribeToGames(leagueId, (games) => {
      setOngoingGames(games.filter((game) => !game.ended));
      setFinishedGames(games.filter((game) => game.ended));
    });

    return () => {
      unsubscribePlayers();
      unsubscribeGames();
    };
  }, [leagueId]);

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers((prev) =>
      prev.some((p) => p.id === player.id && !p.isPlaying)
        ? prev.filter((p) => p.id !== player.id && !p.isPlaying)
        : prev.length < 4
        ? [...prev, player]
        : prev.filter((x) => !x.isPlaying)
    );
  };

  const enterGame = (game: Game) => {
    navigate(ROUTE_PATHS.SCORE_POINTS.replace(":leagueId", leagueId!), {
      state: {
        jugadores: game.teams?.FirstTeam.concat(game.teams?.SecondTeam),
        partidaId: game.id,
      },
    });
  };

  const deleteGame = (gameId: string) => {
    removeGame(leagueId!, gameId)
      .then(() => console.log("Partida eliminada con éxito"))
      .catch((error) => console.error("Error al eliminar la partida:", error));
  };

  const startNewGame = async () => {
    if (!leagueId || selectedPlayers.length !== 4) return;

    const [firstTeam, secondTeam] = [
      selectedPlayers.slice(0, 2),
      selectedPlayers.slice(2),
    ];

    const newGame: Game = {
      date: new Date().toLocaleDateString(),
      ended: false,
      idTeamWinner: "",
      idTeamLooser: "",
    } as Game;

    const gameId = await startGame(leagueId, newGame, firstTeam, secondTeam);

    enterGame({
      id: gameId,
      teams: { FirstTeam: firstTeam, SecondTeam: secondTeam },
    } as Game);

    await Promise.all(
      selectedPlayers.map((player) =>
        updatePlayerStatus(leagueId, player.id, { isPlaying: true })
      )
    );
  };

  return (
    <div>
      <h2>Iniciar Partida</h2>
      <GameSelection
        players={players}
        selectedPlayers={selectedPlayers}
        onPlayerSelect={togglePlayerSelection}
        onStartGame={startNewGame}
      />
      <h4 className="mt-4">Partidas en Curso</h4>
      <GameList
        games={ongoingGames}
        onJoinGame={enterGame}
        onDeleteGame={deleteGame}
      />
      <h4 className="mt-4">Partidas del Día</h4>
      <GameList games={finishedGames} onJoinGame={enterGame} />
    </div>
  );
};

export default StartGame;
