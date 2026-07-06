import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Tests from "./pages/Tests";
import Tracker from "./pages/Tracker";
import Journal from "./pages/Journal";
import Breathe from "./pages/Breathe";
import Learn from "./pages/Learn";
import Community from "./pages/Community";
import Resources from "./pages/Resources";
import AIAssistant from "./pages/AIAssistant";

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Home /></Page>} />
        <Route path="/tests" element={<Page><Tests /></Page>} />
        <Route path="/tracker" element={<Page><Tracker /></Page>} />
        <Route path="/journal" element={<Page><Journal /></Page>} />
        <Route path="/breathe" element={<Page><Breathe /></Page>} />
        <Route path="/learn" element={<Page><Learn /></Page>} />
        <Route path="/community" element={<Page><Community /></Page>} />
        <Route path="/resources" element={<Page><Resources /></Page>} />
        <Route path="/ai" element={<Page><AIAssistant /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#0a0a0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-500 overflow-x-hidden">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
          <AnimatedRoutes />
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800/60 py-10 px-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">MindSpace</span> is a self-care companion,
            not a medical service. It does not provide diagnosis or treatment. If you're in crisis,
            call or text <span className="font-bold text-rose-500">988</span> (US) or your local emergency number.
          </p>
        </footer>
      </div>
    </Router>
  );
}
