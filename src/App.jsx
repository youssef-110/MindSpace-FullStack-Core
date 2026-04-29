import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; 
import Home from './pages/Home';
import Tests from './pages/Tests';
import Tracker from './pages/Tracker';
import Community from './pages/Community';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      {/* The global wrapper forces the background and text to match the mode */}
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 font-sans">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;