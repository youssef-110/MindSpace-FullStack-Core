import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon, PageHeader, Reveal, Sky } from "../components/ui";
import { PATTERNS } from "../components/breathe/timeline";
import { useBreathClock } from "../components/breathe/useBreathClock";
import Orb from "../components/breathe/Orb";
import SkyPills from "../components/breathe/SkyPills";
import Grounding from "../components/breathe/Grounding";

const MINUTES = [1, 3, 5];
const PATTERN_PILLS = PATTERNS.map((p) => [p.id, p.pill]);
const MINUTE_PILLS = MINUTES.map((m) => [m, `${m} min`]);
const ACTION = { idle: "Start", running: "Pause", paused: "Resume", done: "Breathe again" };
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const MORE = [
  ["/checkin", "smile", "Daily check-in", "Note how you feel today."],
  ["/help", "heart", "Get help now", "Crisis lines, and how to find a professional."],
];

function BreathingSky() {
  const [patternId, setPatternId] = useState("calm");
  const [minutes, setMinutes] = useState(3);
  const pattern = PATTERNS.find((p) => p.id === patternId);
  const session = useBreathClock(pattern, minutes * 60_000);
  const { status, breaths } = session;
  const [label, secs] = pattern.phases[session.index];

  // Read out at phase changes only: the text below changes once per phase, never per second.
  const spoken = { idle: "", running: `${label}, ${secs} seconds`, paused: "Paused", done: `Session complete. ${plural(breaths, "breath")}.` }[status];
  const line = {
    idle: "Follow the circle with your breath",
    running: `${clock(session.remaining)} left · ${plural(breaths, "breath")}`,
    paused: `${clock(session.remaining)} left · ${plural(breaths, "breath")}`,
    done: `${plural(breaths, "slow breath")} in ${plural(minutes, "minute")}. Notice how you feel.`,
  }[status];

  return (
    <Sky sun={false} aria-label="Breathing exercise" className="flex min-h-[600px] flex-col items-center justify-between gap-7 rounded-[var(--r-xl)] px-4 py-6 sm:min-h-[700px] sm:p-10">
      <div className="grid justify-items-center gap-4">
        <SkyPills id="breathe-pattern" label="Breathing pattern" options={PATTERN_PILLS} value={patternId} onChange={(id) => { setPatternId(id); session.reset(); }} />
        <p className="sky-text max-w-md text-center text-[0.9375rem] font-medium">
          {pattern.name}. {pattern.desc}
        </p>
      </div>

      <Orb scale={session.scale} status={status} label={label} count={session.left} />
      <p className="sr-only" aria-live="polite">{spoken}</p>

      <div className="grid w-full max-w-sm justify-items-center gap-4 rounded-[26px] bg-[rgba(14,18,64,0.5)] p-4 backdrop-blur-md">
        <p className="num text-center text-sm font-medium">{line}</p>
        <SkyPills id="breathe-minutes" label="Session length" options={MINUTE_PILLS} value={minutes} onChange={(m) => { setMinutes(m); session.reset(); }} />
        <div className="flex w-full gap-2.5">
          <button type="button" className="btn btn-sky flex-1 focus-visible:outline-white" onClick={session.toggle}>
            {status !== "running" && <Icon name={status === "done" ? "refresh" : "play"} size={18} />}
            {ACTION[status]}
          </button>
          <button type="button" className="btn btn-sky-ghost focus-visible:outline-white" onClick={session.reset} disabled={status === "idle"}>
            Reset
          </button>
        </div>
      </div>
    </Sky>
  );
}

export default function Breathe() {
  return (
    <div>
      <PageHeader className="!mb-8" title="Breathe and ground" lead="Two minutes of slow breathing can calm your body's stress response. Pick one and follow along." />

      <BreathingSky />
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ink-3">
        Breathing exercises are a self-help tool, not treatment. If you have a respiratory or heart condition, breathe comfortably and skip the breath holds.
      </p>

      <div className="mt-14 grid items-start gap-5 md:mt-20 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Reveal>
          <Grounding />
        </Reveal>
        <Reveal delay={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {MORE.map(([to, icon, title, text]) => (
            <Link key={to} to={to} className="card card-hover flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sunken text-ink">
                <Icon name={icon} />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-ink">{title}</span>
                <span className="block text-sm text-ink-3">{text}</span>
              </span>
              <Icon name="chevron" size={18} className="text-ink-3" />
            </Link>
          ))}
        </Reveal>
      </div>
    </div>
  );
}
