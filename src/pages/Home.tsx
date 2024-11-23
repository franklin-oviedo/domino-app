import { useState, useEffect } from "react";
import { database } from "../firebase";
import "firebase/compat/database"; // Ensure database is imported
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../helpers/routes";
import { SessionStorageKeys } from "../constants/sessionStorageKeys";

export const Home = () => {
  const [ligaName, setLigaName] = useState("");
  const [ligas, setLigas] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const ligasRef = database.ref("ligas/");
    ligasRef.on("value", (snapshot) => {
      const data = snapshot.val();
      const ligasList = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setLigas(ligasList);
    });

    return () => ligasRef.off();
  }, []);

  const handleCreateLeague = () => {
    if (ligaName.trim() === "") {
      alert("League name cannot be empty.");
      return;
    }

    const ligasRef = database.ref("ligas/");
    const newLigaRef = ligasRef.push();
    newLigaRef
      .set({ name: ligaName })
      .then(() => {
        setLigaName("");
        navigate(
          ROUTE_PATHS.LEAGUE_OPTIONS.replace(":leagueId", newLigaRef.key!)
        );
      })
      .catch((error) => {
        console.error("Error creating league:", error);
      });
  };

  const handleSelectLeague = (leagueId: string) => {
    sessionStorage.setItem(SessionStorageKeys.LEAGUE_ID, leagueId!);
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
            onClick={() => handleSelectLeague(liga.id)}
          >
            {liga.name}
          </button>
        ))}
      </div>
      {ligas.length === 0 && <p className="text-center">No leagues created.</p>}
    </div>
  );
};
