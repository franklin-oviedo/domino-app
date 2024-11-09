// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Liga from './pages/Liga';
import Jugadores from './pages/Jugadores';
import IniciarPartida from './pages/IniciarPartida';
import AnotarPuntos from './pages/AnotarPuntos';
import Estadisticas from './pages/Estadisticas';
import Resultados from './pages/Resultados';
import OpcionesLiga from './pages/OpcionesLiga'
import 'bootstrap/dist/css/bootstrap.min.css';
import PartidasEnCurso from './pages/PartidasEnCurso';

function App() {
  return (
    <Router>
      <div className="container mt-4">
      <div className="d-flex justify-content-center">
          <img src="/dominoes-gtl.png" alt="Logo de la Aplicación" width="200" height="200" />
        </div>
        <Routes>
          <Route path="/" element={<Liga />} />
          <Route path="/opciones-liga/:ligaId" element={<OpcionesLiga />} />
          <Route path="/jugadores/:ligaId" element={<Jugadores />} />
          <Route path="/iniciar-partida/:ligaId" element={<IniciarPartida />} />
          <Route path="/partidas-en-curso/:ligaId" element={<PartidasEnCurso />} />
          <Route path="/anotar-puntos/:ligaId" element={<AnotarPuntos />} />
          <Route path="/estadisticas/:ligaId" element={<Estadisticas />} />
          <Route path="/estadisticas/:ligaId/:jugadorId" element={<Estadisticas />} />
          <Route path="/resultados/:ligaId/:equipoGanador" element={<Resultados />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;