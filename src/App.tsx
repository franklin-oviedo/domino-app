// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Liga from './components/Liga';
import Jugadores from './components/Jugadores';
import IniciarPartida from './components/IniciarPartida';
import AnotarPuntos from './components/AnotarPuntos';
import Estadisticas from './components/Estadisticas';
import Resultados from './components/Resultados';
import OpcionesLiga from './components/OpcionesLiga'
import 'bootstrap/dist/css/bootstrap.min.css';
import PartidasEnCurso from './components/PartidasEnCurso';

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