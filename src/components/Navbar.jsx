import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Tests', path: '/tests' },
    { name: 'Tracker', path: '/tracker' },
    { name: 'Community', path: '/community' },
    { name: 'AI Assistant', path: '/ai' } // Added the AI route here
  ];

  return (
    <header className="fixed top-6 left-0 w-full z-[100] px-4">
      <nav className="max-w-fit mx-auto flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xl">
        
        {links.map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              location.pathname === link.path 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {link.name}
          </Link>
        ))}

        <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-700 mx-2" />

        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:scale-110 active:scale-95 transition-all"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  );
}