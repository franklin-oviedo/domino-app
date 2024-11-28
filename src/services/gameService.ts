import { database } from "../firebase";
import {
  ref,
  onValue,
  update,
  get,
  push,
  remove,
  set,
} from "firebase/database";

export const subscribeToGame = (
  leagueId: string,
  partidaId: string,
  callback: (data: any) => void
) => {
  const partidaRef = ref(database, `ligas/${leagueId}/partidas/${partidaId}`);
  const unsubscribe = onValue(partidaRef, (snapshot) => {
    callback(snapshot.val());
  });
  return unsubscribe;
};

export const savePoints = async (
  leagueId: string,
  partidaId: string,
  teamKey: "FirstTeam" | "SecondTeam",
  points: Record<string, number>
) => {
  const partidaRef = ref(database, `ligas/${leagueId}/partidas/${partidaId}`);
  await update(partidaRef, {
    [`teams/${teamKey}/2`]: points,
  });
};

export const endGame = async (
  leagueId: string,
  partidaId: string,
  winnerKey: "FirstTeam" | "SecondTeam",
  loserKey: "FirstTeam" | "SecondTeam"
) => {
  const partidaRef = ref(database, `ligas/${leagueId}/partidas/${partidaId}`);
  await update(partidaRef, {
    ended: true,
    idTeamWinner: winnerKey,
    idTeamLooser: loserKey,
  });
};

export const updatePlayerStats = async (
  leagueId: string,
  jugadorId: string,
  jugadorData: any,
  isWinner: boolean
) => {
  const jugadorRef = ref(database, `ligas/${leagueId}/jugadores/${jugadorId}`);
  await update(jugadorRef, {
    isPlaying: false,
    totalPartidas: (jugadorData.totalPartidas || 0) + 1,
    partidasGanadas: isWinner
      ? (jugadorData.partidasGanadas || 0) + 1
      : jugadorData.partidasGanadas,
    partidasPerdidas: isWinner
      ? jugadorData.partidasPerdidas
      : (jugadorData.partidasPerdidas || 0) + 1,
  });
};

export const subscribeToGames = (
  leagueId: string,
  callback: (games: any[]) => void
) => {
  const gamesRef = ref(database, `ligas/${leagueId}/partidas`);
  const unsubscribe = onValue(gamesRef, (snapshot) => {
    const data = snapshot.val() ?? {};
    const games = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
    callback(games);
  });
  return () => unsubscribe();
};

export const startGame = async (
  leagueId: string,
  game: any,
  firstTeam: any[],
  secondTeam: any[]
): Promise<string> => {
  const gameRef = push(ref(database, `ligas/${leagueId}/partidas`));
  game.id = gameRef.key!;
  await set(gameRef, game);
  const teamsRef = ref(database, `ligas/${leagueId}/partidas/${game.id}/teams`);
  await set(teamsRef, {
    FirstTeam: firstTeam.map(({ id, name }) => ({ id, name })),
    SecondTeam: secondTeam.map(({ id, name }) => ({ id, name })),
  });
  return game.id;
};

export const removeGame = async (leagueId: string, gameId: string) => {
  const gameRef = ref(database, `ligas/${leagueId}/partidas/${gameId}`);
  await remove(gameRef);
};

export const updatePlayerStatus = async (
  leagueId: string,
  playerId: string,
  updates: any
) => {
  const playerRef = ref(database, `ligas/${leagueId}/jugadores/${playerId}`);
  await update(playerRef, updates);
};
