import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, push, set, remove } from "firebase/database";
import { useParams, useNavigate } from 'react-router-dom';

function IniciarPartida() {
  const { ligaId } = useParams();
  const navigate = useNavigate();
  const [jugadores, setJugadores] = useState([]);
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([]);
  const [partidasEnCurso, setPartidasEnCurso] = useState([]);
  const [partidasFinalizadas, setPartidasFinalizadas] = useState([]);

  useEffect(() => {
    const jugadoresRef = ref(database, `ligas/${ligaId}/jugadores`);
    onValue(jugadoresRef, (snapshot) => {
      const data = snapshot.val();
      const jugadoresList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setJugadores(jugadoresList);
    });

    const partidasRef = ref(database, `ligas/${ligaId}/partidas`);
    onValue(partidasRef, (snapshot) => {
      const data = snapshot.val();
      const partidasList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      
      // Filtrar partidas en curso y finalizadas
     // console.log(data)
     // console.log(partidasList)
      setPartidasEnCurso(partidasList.filter(partida => !partida.finalizado));
      setPartidasFinalizadas(partidasList.filter(partida => partida.finalizado));
    });
  }, [ligaId]);

  const handleSeleccionarJugador = (jugador) => {
    if (jugadoresSeleccionados.length < 4 && !jugadoresSeleccionados.some(j => j.id === jugador.id)) {
      setJugadoresSeleccionados([...jugadoresSeleccionados, jugador]);
    } else if (jugadoresSeleccionados.some(j => j.id === jugador.id)) {
      setJugadoresSeleccionados(jugadoresSeleccionados.filter(j => j.id !== jugador.id));
    }
  };

  const handleIniciarPartida = () => {
    if (jugadoresSeleccionados.length === 4) {
      const jugadoresEnPartida = partidasEnCurso.flatMap(partida => partida.jugadores);
      const jugadoresActuales = jugadoresSeleccionados.map(j => j.name);

      const jugadoresEnCurso = jugadoresEnPartida.filter(jugador => jugadoresActuales.includes(jugador));
      
      if (jugadoresEnCurso.length > 0) {
        alert(`No puedes iniciar una nueva partida porque los siguientes jugadores ya están en una partida en curso: ${jugadoresEnCurso.join(', ')}`);
        return;
      }

      const partidaInicial = {
        puntosEquipo1: 0,
        puntosEquipo2: 0,
        jugadores: jugadoresSeleccionados.map(j => j.name),
        finalizado: false,
      };

      const partidaRef = push(ref(database, `ligas/${ligaId}/partidas`));
      set(partidaRef, partidaInicial)
        .then(() => {
          navigate(`/anotar-puntos/${ligaId}`, { state: { jugadores: jugadoresSeleccionados, partidaId: partidaRef.key } });
        })
        .catch((error) => {
          console.error("Error al iniciar la partida:", error);
        });
    }
  };

  const savePartida = () =>{
   
    let partidaId = "";

    //Save Partida //
    let date = new Date().toLocaleDateString();
    const partidaInicial = {
      date: date,
      idTeamWinner: "",
      idTeamLooser: "",
      ended: false,
    };

    const partidaRef = push(ref(database, `ligas/${ligaId}/partidas`));
    set(partidaRef, partidaInicial)
      .then(() => {
        savePlayers(partidaRef.key);
      })
      .catch((error) => {
        console.error("Error al iniciar la partida:", error);
      });
  }


  const savePlayers = (partidaId) =>{
    ////// Save teams //
    var firstTeam = jugadoresSeleccionados.slice(0, 2);
    var secondTeam = jugadoresSeleccionados.slice(2);

    const ref = database.ref(`ligas/${ligaId}/partidas/${partidaId}/teams`);

    ref.set({
      FirstTeam : firstTeam.map(({id, name}) => ({id,name})),
      SecondTeam : secondTeam.map(({id, name}) => ({id,name}))
    });

  }

  const savePoints = (partidaId, teamNumberId = 1, points = 0) => {
    let teamId = teamNumberId == 1 ? 'FirstTeam' : 'SecondTeam';
    const ref = database.ref(`ligas/${ligaId}/partidas/${partidaId}/teams/${teamId}/points`);

    ref.set({
      Points : points
    })
  }

  const handleEntrarPartida = (partida) => {
    const jugadoresEnPartida = partida.jugadores;
    const jugadorActual = jugadoresSeleccionados.map(j => j.name);

    if (!jugadoresEnPartida.includes(jugadorActual[0])) {
      navigate(`/anotar-puntos/${ligaId}`, { state: { jugadores: jugadoresEnPartida, partidaId: partida.id } });
    } else {
      alert("No puedes unirte a esta partida porque ya estás participando en otra.");
    }
  };

  const handleBorrarPartida = (partidaId) => {
    const partidaRef = ref(database, `ligas/${ligaId}/partidas/${partidaId}`);
    remove(partidaRef)
      .then(() => {
        console.log("Partida eliminada con éxito");
      })
      .catch((error) => {
        console.error("Error al eliminar la partida:", error);
      });
  };

  return (
    <div>
      <h2>Iniciar Partida</h2>
      <h4>Selecciona 4 jugadores para iniciar la partida</h4>
      <button onClick={savePartida}>Test</button>
      <button onClick={() => savePoints('-OBHeHJP10jwMfNZtU05',1,40)}>Test2</button>
     
     
      <div className="row">
        {jugadores.map((jugador) => (
          <div className="col-12 col-md-6 col-lg-3" key={jugador.id}>
            <div 
              className={`card mb-2 ${jugadoresSeleccionados.some(j => j.id === jugador.id) ? 'border-primary' : ''}`}
              onClick={() => handleSeleccionarJugador(jugador)}
            >
              <div className="card-body text-center">
                <h5 className="card-title">{jugador.name}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jugadoresSeleccionados.length === 4 && (
        <div className="mt-4">
          <button className="btn btn-success" onClick={handleIniciarPartida}>
            Iniciar Partida
          </button>
        </div>
      )}

      <h4 className="mt-4">Partidas en Curso</h4>
      {partidasEnCurso.length > 0 ? (
        <ul className="list-group">
          {partidasEnCurso.map(partida => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={partida.id}>
              {/* {`Partida ID: ${partida.id} - Jugadores: ${partida.jugadores.join(' - ')}`} */}
              <div>
                <button className="btn btn-info btn-sm me-2" onClick={() => handleEntrarPartida(partida)}>
                  Entrar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleBorrarPartida(partida.id)}>
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay partidas en curso.</p>
      )}

      <h4 className="mt-4">Partidas del Día</h4>
      {partidasFinalizadas.length > 0 ? (
        <ul className="list-group">
          {partidasFinalizadas.map(partida => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={partida.id}>
              {/* {`Partida ID: ${partida.id} - Jugadores: ${partida.jugadores.join(' - ')} - Puntos: ${partida.puntosEquipo1} - ${partida.puntosEquipo2}`} */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay partidas finalizadas hoy.</p>
      )}
    </div>
  );
}

export default IniciarPartida;
