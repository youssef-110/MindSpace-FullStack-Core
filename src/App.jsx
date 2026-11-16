import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { MotionConfig, motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { LogoMark, Wordmark, Icon, EASE } from "./components/ui";
import AuthProvider from "./components/AuthProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./lib/auth-context";

const Home = lazy(() => import("./pages/Home"));
const Learn = lazy(() => import("./pages/Learn"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Tests = lazy(() => import("./pages/Tests"));
const TakeTest = lazy(() => import("./pages/TakeTest"));
const Result = lazy(() => import("./pages/Result"));
const Results = lazy(() => import("./pages/Results"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const Ask = lazy(() => import("./pages/Ask"));
const Breathe = lazy(() => import("./pages/Breathe"));
const Help = lazy(() => import("./pages/Help"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Account = lazy(() => import("./pages/Account"));
const Privacy = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Terms })));
const Contact = lazy(() => import("./pages/Contact"));

const NAV = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/learn", label: "Learn", icon: "learn" },
  { to: "/tests", label: "Tests", icon: "tests" },
  { to: "/results", label: "Insights", icon: "results" },
  { to: "/ask", label: "Ask AI", icon: "ask" },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

const iconButton = "grid h-10 w-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-sunken hover:text-ink";

function AccountButton() {
  const { user, ready } = useAuth();
  if (!ready) return <span className="h-10 w-10" aria-hidden="true" />;
  return user ? (
    <NavLink to="/account" aria-label="Your account" className={({ isActive }) => `${iconButton} ${isActive ? "bg-sunken text-ink" : ""}`}>
      <Icon name="user" size={20} />
    </NavLink>
  ) : (
    <Link to="/signin" className="btn btn-dark btn-sm">
      Sign in
    </Link>
  );
}

// The floating capsule: replaces a full-width header bar.
function TopBar({ dark, setDark }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="glass pointer-events-auto mx-auto flex h-14 max-w-[1100px] items-center gap-2 rounded-[22px] pl-3 pr-2 shadow-[var(--halo-ring)] sm:pl-4">
        <Link to="/" aria-label="MindSpace home" className="mr-auto md:mr-4">
          <Wordmark size={28} />
        </Link>
        <nav className="mr-auto hidden items-center md:flex" aria-label="Main">
          {NAV.slice(1).map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${isActive ? "text-ink" : "text-ink-3 hover:text-ink"}`}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-sunken" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                  <span className="relative">{n.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => setDark(!dark)} className={iconButton} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
          <motion.span key={dark ? "sun" : "moon"} initial={{ rotate: -60, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: EASE }} className="grid">
            <Icon name={dark ? "sun" : "moon"} size={20} />
          </motion.span>
        </button>
        <AccountButton />
      </div>
    </header>
  );
}

function BottomTabs() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }} aria-label="Main">
      <div className="glass mx-auto grid max-w-md grid-cols-5 rounded-[26px] p-1.5 shadow-[var(--halo-ring)]">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[20px] text-[0.6875rem] font-medium transition-colors ${isActive ? "text-brand-text" : "text-ink-3"}`}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-[20px] bg-brand-soft" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <Icon name={n.icon} size={21} className="relative" />
                <span className="relative">{n.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const FOOTER = [
  ["Explore", [["Lessons", "/learn"], ["Tests", "/tests"], ["Insights", "/results"], ["Daily check-in", "/checkin"], ["Ask AI", "/ask"]]],
  ["Support", [["Breathing exercise", "/breathe"], ["Get help now", "/help"], ["How our tests work", "/learn/how-tests-work"], ["Contact", "/contact"]]],
  ["Legal", [["Privacy", "/privacy"], ["Terms of use", "/terms"]]],
];

function Footer() {
  return (
    <footer className="mt-24 border-t border-line pb-28 md:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-ink-3">Learn how the mind is measured, then measure your own. For education and self-reflection. Not a medical service, and never a diagnosis.</p>
          <p className="mt-4 max-w-xs text-sm text-ink-3">
            In an emergency call <strong>112</strong> (EU) or <strong>988</strong> (US).
          </p>
        </div>
        {FOOTER.map(([title, links]) => (
          <div key={title}>
            <h2 className="mb-3 font-sans text-sm font-semibold tracking-[-0.02em]">{title}</h2>
            <ul className="space-y-2.5 text-sm">
              {links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-ink-3 transition-colors hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page flex flex-wrap items-center justify-between gap-2 border-t border-line py-6 text-xs text-ink-3">
        <span>© {new Date().getFullYear()} MindSpace</span>
        <span>Scores are calculated in your browser. Nothing leaves your device unless you choose to sync.</span>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <LogoMark size={56} className="animate-float" />
      <h1 className="mt-8 text-5xl">Nothing out here</h1>
      <p className="lead mt-4">This page drifted off. It may have moved.</p>
      <Link to="/" className="btn btn-primary mt-8">
        Back to the start
      </Link>
    </div>
  );
}

// Home runs edge to edge under the nav; every other page sits in the centred column.
function Page() {
  const { pathname } = useLocation();
  const flush = pathname === "/";
  return (
    <main id="main" className={flush ? "pb-10" : "container-page pb-10 pt-24 md:pt-32"}>
      <ErrorBoundary>
        <Suspense fallback={<div className="py-40" aria-busy="true" />}>
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:id" element={<Lesson />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/tests/:id" element={<TakeTest />} />
              <Route path="/results" element={<Results />} />
              <Route path="/results/:id" element={<Result />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/ask" element={<Ask />} />
              <Route path="/breathe" element={<Breathe />} />
              <Route path="/help" element={<Help />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/account" element={<Account />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </Suspense>
      </ErrorBoundary>
    </main>
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
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <a href="#main" className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50">
            Skip to content
          </a>
          <TopBar dark={dark} setDark={setDark} />
          <Page />
          <Footer />
          <BottomTabs />
          <Analytics />
        </BrowserRouter>
      </AuthProvider>
    </MotionConfig>
  );
}
