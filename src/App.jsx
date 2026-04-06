import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Tests from './pages/Tests';
import Tracker from './pages/Tracker';
import Community from './pages/Community';

function App() {
  return (
    <Router>
      <nav style={{ padding: '20px', background: '#f0f0f0', display: 'flex', gap: '15px' }}>
        <Link to="/">Home</Link>
        <Link to="/tests">Tests</Link>
        <Link to="/tracker">Mood Tracker</Link>
        <Link to="/community">Community</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </Router>
  );
}

export default App;