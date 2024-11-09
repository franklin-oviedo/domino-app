// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ROUTE_PATHS } from './helpers/routes';
import { GamesInProgress } from './pages/GamesInProgress';
import { Home } from './pages/Home';
import { LeagueOptions } from './pages/LeagueOptions';
import { Players } from './pages/Players';
import { Results } from './pages/Results';
import { ScorePoints } from './pages/ScorePoints';
import { StartGame } from './pages/StartGame';
import { Statistics } from './pages/Statitics';

const ROUTES = [
  { path: ROUTE_PATHS.HOME, element: <Home /> },
  { path: ROUTE_PATHS.LEAGUE_OPTIONS, element: <LeagueOptions /> },
  { path: ROUTE_PATHS.PLAYERS, element: <Players /> },
  { path: ROUTE_PATHS.START_GAME, element: <StartGame /> },
  { path: ROUTE_PATHS.GAMES_IN_PROGRESS, element: <GamesInProgress /> },
  { path: ROUTE_PATHS.SCORE_POINTS, element: <ScorePoints /> },
  { path: ROUTE_PATHS.STATISTICS, element: <Statistics /> },
  { path: ROUTE_PATHS.PLAYER_STATISTICS, element: <Statistics /> },
  { path: ROUTE_PATHS.RESULTS, element: <Results /> },
];

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <img src="/dominoes-gtl.png" alt="App Logo" width="200" height="200" />
        </div>
        <Routes>
          {ROUTES.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;