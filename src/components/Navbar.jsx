import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Tests', path: '/tests' },
    { name: 'Tracker', path: '/tracker' },
    { name: 'Community', path: '/community' }
  ];

  return (
    <header className="fixed top-6 left-0 w-full z-[100] px-4">
      <nav className="max-w-fit mx-auto flex items-center gap-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-500">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} className="relative px-6 py-2">
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 text-sm font-bold transition-colors duration-300 ${
                isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}>
                {link.name}
              </span>
            </Link>
          );
        })}
        <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-2" />
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-lg"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  );
}