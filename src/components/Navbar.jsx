import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { name: "Home", path: "/", icon: "🏠" },
  { name: "Tracker", path: "/tracker", icon: "📈" },
  { name: "Journal", path: "/journal", icon: "📓" },
  { name: "Breathe", path: "/breathe", icon: "🌬️" },
  { name: "Assessments", path: "/tests", icon: "🧠" },
  { name: "Learn", path: "/learn", icon: "📚" },
  { name: "Community", path: "/community", icon: "🤝" },
  { name: "Companion", path: "/ai", icon: "✨" },
];

export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-[100] px-4 pt-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between glass p-2 pl-4 rounded-full border border-zinc-200/70 dark:border-zinc-800 shadow-xl shadow-zinc-900/5">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white pr-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-sm shadow-md">
            ◑
          </span>
          <span className="font-display text-lg tracking-tight hidden sm:block">MindSpace</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-2 rounded-full text-sm font-bold transition-colors ${
                  active
                    ? "text-white dark:text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-full"
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/resources"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-100 dark:border-rose-900 hover:scale-105 transition-transform"
            title="Crisis resources & hotlines"
          >
            💗 Get help now
          </Link>

          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:scale-110 active:scale-95 transition-all"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden max-w-6xl mx-auto mt-2 glass rounded-3xl border border-zinc-200/70 dark:border-zinc-800 shadow-xl p-3 grid grid-cols-2 gap-2"
          >
            {[...links, { name: "Resources", path: "/resources", icon: "💗" }].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  location.pathname === link.path
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{link.icon}</span> {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
