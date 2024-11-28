import { ref, onValue, push, remove } from "firebase/database";
import { database } from "../firebase";

export interface League {
  id?: string;
  name: string;
}

const leaguesRef = ref(database, "ligas/");

export const getLeagues = (callback: (leagues: League[]) => void) => {
  return onValue(leaguesRef, (snapshot) => {
    const data = snapshot.val();
    const leagues: League[] = data
      ? Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
      : [];
    callback(leagues);
  });
};

export const createLeague = (leagueName: string) => {
  const LRef = database.ref("ligas/");
  const newLeagueRef = LRef.push();
  return newLeagueRef.set({ name: leagueName }).then(() => newLeagueRef.key);
};

export const deleteLeague = (leagueId: string) => {
  const leagueRef = ref(database, `ligas/${leagueId}`);
  return remove(leagueRef);
};
