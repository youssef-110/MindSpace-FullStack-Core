import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { LogoMark, Icon } from "./components/ui";

const Home = lazy(() => import("./pages/Home"));
const Learn = lazy(() => import("./pages/Learn"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Tests = lazy(() => import("./pages/Tests"));
const TakeTest = lazy(() => import("./pages/TakeTest"));
const Result = lazy(() => import("./pages/Result"));
const Results = lazy(() => import("./pages/Results"));
const Ask = lazy(() => import("./pages/Ask"));
const Breathe = lazy(() => import("./pages/Breathe"));
const Help = lazy(() => import("./pages/Help"));

const NAV = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/learn", label: "Learn", icon: "learn" },
  { to: "/tests", label: "Tests", icon: "tests" },
  { to: "/results", label: "My results", icon: "results" },
  { to: "/ask", label: "Ask AI", icon: "ask" },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function TopBar({ dark, setDark }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight" aria-label="MindSpace home">
          <LogoMark size={30} />
          MindSpace
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-1" aria-label="Main">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `rounded-[10px] px-3.5 py-2 text-[0.95rem] font-bold transition-colors ${isActive ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setDark(!dark)}
          className="ml-auto md:ml-2 grid h-11 w-11 place-items-center rounded-[10px] border border-line text-ink-2 hover:text-ink"
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        >
          <Icon name={dark ? "sun" : "moon"} size={20} />
        </button>
      </div>
    </header>
  );
}

function BottomTabs() {
  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main"
    >
      <div className="grid grid-cols-5">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[0.7rem] font-bold ${isActive ? "text-brand" : "text-ink-2"}`
            }
          >
            <Icon name={n.icon} size={22} />
            {n.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line mt-20 pb-24 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <LogoMark size={26} /> MindSpace
          </div>
          <p className="mt-3 max-w-sm text-sm text-ink-2">
            Learn how the mind is measured, then measure your own. For education and self-reflection; not a medical service and not a
            diagnosis.
          </p>
        </div>
        <div className="text-sm">
          <h2 className="font-sans text-sm font-bold mb-2">Explore</h2>
          <ul className="space-y-1.5 text-ink-2">
            <li><Link to="/learn" className="hover:text-ink">Lessons</Link></li>
            <li><Link to="/tests" className="hover:text-ink">Tests</Link></li>
            <li><Link to="/breathe" className="hover:text-ink">Breathing exercise</Link></li>
            <li><Link to="/learn/how-tests-work" className="hover:text-ink">How our tests work</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h2 className="font-sans text-sm font-bold mb-2">Need to talk to someone?</h2>
          <p className="text-ink-2">Call or text <strong className="text-ink">988</strong> (US), text HOME to 741741, or your local emergency number.</p>
          <Link to="/help" className="link mt-2 inline-block">Get help</Link>
        </div>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-4xl font-bold mb-3">This page is the missing piece</h1>
      <p className="text-ink-2 mb-6">We couldn't find it. It may have moved.</p>
      <Link to="/" className="btn btn-primary">Go to the home page</Link>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollToTop />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 btn btn-primary">Skip to content</a>
        <TopBar dark={dark} setDark={setDark} />
        <main id="main" className="mx-auto max-w-6xl px-4 pb-24 md:pb-0">
          <Suspense fallback={<div className="py-32" aria-busy="true" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:id" element={<Lesson />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/tests/:id" element={<TakeTest />} />
              <Route path="/results" element={<Results />} />
              <Route path="/results/:id" element={<Result />} />
              <Route path="/ask" element={<Ask />} />
              <Route path="/breathe" element={<Breathe />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <BottomTabs />
      </BrowserRouter>
    </MotionConfig>
  );
}
