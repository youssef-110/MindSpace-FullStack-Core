import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Home from './pages/Home';
import Tests from './pages/Tests';
import Tracker from './pages/Tracker';
import Community from './pages/Community';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      {/* FORCE FIX: We apply the "dark" class here too. 
        If the HTML tag fails, this div will catch it.
      */}
      <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
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
      </div>
    </Router>
  );
}

export default App;