import {
  DatabaseReference,
  onValue,
  push,
  ref,
  remove,
  update,
} from "firebase/database";
import { database } from "../firebase";
import { SessionStorageKeys } from "../constants/sessionStorageKeys";

export interface Player {
  id?: string;
  name: string;
  partidasGanadas: number;
  partidasPerdidas: number;
  average: number;
  totalPartidas: number;
  isPlaying: boolean;
}

interface PlayersHttpConfig {
  leagueId?: string;
  playersRef?: DatabaseReference;
  singlePlayerUrl: (playerId: string) => string;
}

const http: PlayersHttpConfig = {
  singlePlayerUrl: () => "",
};

export const getPlayers = (callback: (playerList: Player[]) => void) => {
  setConstants();

  return onValue(http.playersRef!, (snapshot) => {
    const data = snapshot.val();
    const playerList: Player[] = data
      ? Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
      : [];
    callback(playerList);
  });
};
export const getPlayersByLeague = (
  leagueId: string,
  callback: (players: any[]) => void
) => {
  return onValue(http.playersRef!, (snapshot) => {
    const data = snapshot.val();
    const players = data
      ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
      : [];
    callback(players);
  });
};

export const addPlayer = (playerName: string) => {
  setConstants();

  const newPlayer: Player = {
    name: playerName,
    partidasGanadas: 0,
    partidasPerdidas: 0,
    average: 0,
    totalPartidas: 0,
    isPlaying: false,
  };

  return push(http.playersRef!, newPlayer);
};

export const removePlayer = (playerId: string) => {
  setConstants();

  const singlePlayerRef = ref(database, http.singlePlayerUrl(playerId));
  return remove(singlePlayerRef);
};

export const changeName = (newName: string, playerId: string) => {
  setConstants();

  const singlePlayerRef = ref(database, http.singlePlayerUrl(playerId));
  return update(singlePlayerRef, { name: newName });
};

const setConstants = () => {
  const leagueId = sessionStorage.getItem(SessionStorageKeys.LEAGUE_ID);

  if (!leagueId) {
    throw new Error("League ID is not set in session storage.");
  }

  const playersUrl = `ligas/${leagueId}/jugadores`;

  http.leagueId = leagueId;
  http.playersRef = ref(database, playersUrl);
  http.singlePlayerUrl = (playerId: string) => `${playersUrl}/${playerId}`;
};
