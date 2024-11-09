import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue, push, set, remove } from "firebase/database";
import { useParams, useNavigate } from "react-router-dom";
import { GameList } from "../components/Game/GameItem/GameItemList";
import { GameSelection } from "../components/Game/GameSelection";
import { ROUTE_PATHS } from "../helpers/routes";

interface Player {
  id: string;
  name: string;
}

// Generated by https://quicktype.io

 interface Teams {
  FirstTeam: TeamElement[];
  SecondTeam: TeamElement[];
}

 interface TeamElement {
  id: string;
  name: string;
}

export interface Game {
  date: string;
  ended: boolean;
  id: string;
  idTeamLooser: string;
  idTeamWinner: string;
  teams: Teams;
}

const StartGame: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [ongoingGames, setOngoingGames] = useState<Game[]>([]);
  const [finishedGames, setFinishedGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!leagueId) return;

    const playersRef = ref(database, `ligas/${leagueId}/jugadores`);
    const gamesRef = ref(database, `ligas/${leagueId}/partidas`);

    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val() ?? {};
      setPlayers(Object.keys(data).map((key) => ({ id: key, ...data[key] })));
    });

    const unsubscribeGames = onValue(gamesRef, (snapshot) => {
      const data = snapshot.val() ?? {};
      const games = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setOngoingGames(games.filter((game) => !game.finalizado));
      setFinishedGames(games.filter((game) => game.finalizado));
    });

    return () => {
      unsubscribePlayers();
      unsubscribeGames();
      console.log(players);
    };
  }, [leagueId]);

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers((prev) =>
      prev.some((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : prev.length < 4
        ? [...prev, player]
        : prev
    );
  };

  const enterGame = (game: Game) => {
    // Check if the player is in the FirstTeam or SecondTeam
    const isInFirstTeam = game.teams.FirstTeam.some(
      (player) => player.name === selectedPlayers[0]?.name
    );
    const isInSecondTeam = game.teams.SecondTeam.some(
      (player) => player.name === selectedPlayers[0]?.name
    );

    if (!isInFirstTeam && !isInSecondTeam) {
      navigate(`${ROUTE_PATHS.SCORE_POINTS}${leagueId}`, {
        state: {
          jugadores: game.teams.FirstTeam.concat(game.teams.SecondTeam),
          partidaId: game.id,
        },
      });
    } else {
      alert(
        "No puedes unirte a esta partida porque ya estás participando en otra."
      );
    }
  };

  const deleteGame = (gameId: string) => {
    remove(ref(database, `ligas/${leagueId}/partidas/${gameId}`))
      .then(() => console.log("Partida eliminada con éxito"))
      .catch((error) => console.error("Error al eliminar la partida:", error));
  };
  const startNewGame = () => {
    let partidaId = "";

    //Save Partida //
    let date = new Date().toLocaleDateString();
    const partidaInicial = {
      date: date,
      idTeamWinner: "",
      idTeamLooser: "",
      ended: false,
    };

    const partidaRef = push(ref(database, `ligas/${leagueId}/partidas`));
    set(partidaRef, partidaInicial)
      .then(() => {
        savePlayers(partidaRef.key!);
      })
      .catch((error) => {
        console.error("Error al iniciar la partida:", error);
      });
  };

  const savePlayers = (partidaId: string) => {
    ////// Save teams //
    var firstTeam = selectedPlayers.slice(0, 2);
    var secondTeam = selectedPlayers.slice(2);

    const ref = database.ref(`ligas/${leagueId}/partidas/${partidaId}/teams`);

    ref.set({
      FirstTeam: firstTeam.map(({ id, name }) => ({ id, name })),
      SecondTeam: secondTeam.map(({ id, name }) => ({ id, name })),
    });
  };

  const savePoints = (partidaId: string, teamNumberId = 1, points = 0) => {
    let teamId = teamNumberId == 1 ? "FirstTeam" : "SecondTeam";
    const ref = database.ref(
      `ligas/${leagueId}/partidas/${partidaId}/teams/${teamId}/points`
    );

    ref.set({
      Points: points,
    });
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
      <GameList
        games={finishedGames}
        onJoinGame={enterGame}
        onDeleteGame={deleteGame}
      />
    </div>
  );
};

export default StartGame;