import { Link, useLocation } from 'react-router-dom';

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
      <nav className="max-w-fit mx-auto flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-500">
        
        {/* Navigation Links */}
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {link.name}
            </Link>
          );
        })}

        <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-2"></div>

        {/* Dark Mode Toggle Button */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:scale-110 transition-transform"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

      </nav>
    </header>
  );
}