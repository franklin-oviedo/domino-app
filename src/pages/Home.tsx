import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../helpers/routes";
import { SessionStorageKeys } from "../constants/sessionStorageKeys";
import { getLeagues, createLeague, League } from "../services/leaguesService";

export const Home = () => {
  const [ligaName, setLigaName] = useState("");
  const [ligas, setLigas] = useState<League[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = getLeagues(setLigas);

    return () => unsubscribe(); // Clean up the Firebase listener
  }, []);

  const handleCreateLeague = async () => {
    if (ligaName.trim() === "") {
      alert("League name cannot be empty.");
      return;
    }

    try {
      const leagueId = await createLeague(ligaName);
      setLigaName("");
      navigate(ROUTE_PATHS.LEAGUE_OPTIONS.replace(":leagueId", leagueId!));
      sessionStorage.setItem(SessionStorageKeys.LEAGUE_ID, leagueId!);
    } catch (error) {
      console.error("Error creating league:", error);
    }
  };

  const handleSelectLeague = (leagueId: string) => {
    sessionStorage.setItem(SessionStorageKeys.LEAGUE_ID, leagueId);
    navigate(ROUTE_PATHS.LEAGUE_OPTIONS.replace(":leagueId", leagueId));
  };

  return (
    <div>
      <h2 className="text-center mb-4">Crear liga nueva</h2>

      <div className="input-group mb-3">
        <input
          type="text"
          value={ligaName}
          onChange={(e) => setLigaName(e.target.value)}
          placeholder="Nombre de liga nueva"
          className="form-control"
        />
        <button
          title="Crear liga nueva"
          disabled={!ligaName}
          onClick={handleCreateLeague}
          className="btn btn-primary"
        >
          <i className="bi bi-plus fs-5"></i>
        </button>
      </div>

      <h4 className="text-center">Ligas existentes</h4>
      <div className="list-group mb-4">
        {ligas.map((liga) => (
          <button
            key={liga.id}
            className="list-group-item list-group-item-action"
            onClick={() => handleSelectLeague(liga.id!)}
          >
            {liga.name}
          </button>
        ))}
      </div>
      {ligas.length === 0 && <p className="text-center">No leagues created.</p>}
    </div>
  );
};
