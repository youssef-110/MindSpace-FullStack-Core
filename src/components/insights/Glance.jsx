import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ring, Meter, Sparkline, Stagger, StaggerItem, Icon, TONE, EASE } from "../ui";
import { CATEGORIES, byId } from "../../lib/tests/questionnaires";
import { fmtDay, plural, scoreText, trend, byTest } from "./shape";

const ranged = (r) => Number.isFinite(r.max) && Number.isFinite(r.min ?? 0);

// Trait profile: one thin bar per trait. The key and score are real text, so no extra label is needed.
function TraitBars({ traits }) {
  // One-letter keys (Big Five) fit a narrow column; named subscales need the room.
  const label = traits.some((t) => t.key.length > 2) ? "7.5rem" : "1.25rem";
  return (
    <ul className="grid gap-1.5">
      {traits.map((t, i) => (
        <li key={t.key} className="grid items-center gap-2 text-xs" style={{ gridTemplateColumns: `${label} 1fr 2rem` }}>
          <span className="truncate font-semibold text-ink" title={t.name}>
            {t.key.length > 2 ? t.name : t.key}
            {t.key.length <= 2 && <span className="sr-only"> ({t.name})</span>}
          </span>
          <span className="h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
            <motion.span className="block h-full origin-left rounded-full" style={{ background: TONE[t.tone]?.color ?? "var(--brand)" }} initial={{ scaleX: 0 }} whileInView={{ scaleX: Math.min(1, Math.max(0.03, (t.score - (t.min ?? 0)) / ((t.max ?? 100) - (t.min ?? 0) || 1))) }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.06 }} />
          </span>
          <span className="num text-right text-ink-3">{t.score}</span>
        </li>
      ))}
    </ul>
  );
}

// The picture and the level tag for one result, whatever its shape.
function Reading({ name, r }) {
  if (r.type === "traits") return <TraitBars traits={r.traits ?? []} />;
  if (r.type === "matrix") {
    return (
      <div className="flex items-center gap-4">
        <Ring value={r.estimate} min={55} max={145} size={76} stroke={7} label={`${name}: practice estimate ${r.estimate}, likely range ${r.low} to ${r.high}`}>
          <span className="num text-lg font-semibold text-ink">{r.estimate}</span>
        </Ring>
        <div className="min-w-0">
          <span className="tag tag-brand">Practice estimate</span>
          <p className="num mt-2 text-sm text-ink-3">Range {r.low} to {r.high}</p>
        </div>
      </div>
    );
  }
  if (r.type === "threshold") {
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="num text-2xl font-semibold text-ink">{scoreText(r)}</span>
          <span className={`tag ${r.positive ? "tag-brand" : ""}`}>{r.positive ? "At or above cut-off" : "Below cut-off"}</span>
        </div>
        <div className="mt-4">
          <Meter value={r.score} max={r.max} cutoff={r.cutoff} label={`${name}: ${r.score} of ${r.max}, research cut-off ${r.cutoff}`} />
        </div>
      </div>
    );
  }
  const tone = TONE[r.band?.tone] ?? TONE.ok;
  return (
    <div className="flex items-center gap-4">
      {ranged(r) && !r.unit ? (
        <Ring value={r.score} min={r.min ?? 0} max={r.max} size={76} stroke={7} color={tone.color} label={`${name}: ${r.score} on a scale from ${r.min ?? 0} to ${r.max}`}>
          <span className="num text-lg font-semibold text-ink">{r.score}</span>
        </Ring>
      ) : (
        <span className="num display text-4xl">{r.score}</span>
      )}
      <div className="min-w-0">
        {r.band?.level && <span className={`tag ${tone.tag}`}>{r.band.level}</span>}
        <p className="num mt-2 text-sm text-ink-3">
          {scoreText(r)}
          {Number.isFinite(r.percentile) && `, percentile ${r.percentile}`}
        </p>
      </div>
    </div>
  );
}

function ResultCard({ attempts }) {
  const [latest] = attempts;
  const test = byId(latest.testId);
  const change = trend(attempts);
  const r = latest.result;
  const fixed = r.type === "sum" && ranged(r) && !r.unit;
  return (
    <Link to={`/results/${latest.id}`} className="card card-hover group flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[1.0625rem]">{test.name}</h4>
        <Icon name="chevron" size={18} className="mt-0.5 text-ink-3 transition-transform duration-300 group-hover:translate-x-0.5" />
      </div>
      <p className="mt-0.5 text-sm text-ink-3">{fmtDay(latest.date)}</p>
      <div className="mt-5">
        <Reading name={test.name} r={r} />
      </div>
      {change && (
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className={`text-sm ${change.better ? "text-sage" : "text-ink-3"}`}>
            {change.text}
            {change.better && ", an improvement"}
            <span className="block text-xs text-ink-3">{plural(attempts.length, "attempt")}</span>
          </p>
          <Sparkline points={change.points} min={fixed ? (r.min ?? 0) : undefined} max={fixed ? r.max : undefined} width={96} height={32} color={change.better ? "var(--sage)" : "var(--brand)"} />
        </div>
      )}
    </Link>
  );
}

// The latest result for every test taken, grouped by category.
export default function Glance({ results }) {
  const tests = byTest(results);
  const known = new Set(CATEGORIES.map((c) => c.id));
  const groups = [...CATEGORIES, { id: null, name: "Other" }]
    .map((c) => ({ ...c, tests: tests.filter((a) => (c.id ? byId(a[0].testId).category === c.id : !known.has(byId(a[0].testId).category))) }))
    .filter((g) => g.tests.length);
  return (
    <div className="grid gap-9">
      {groups.map((g) => (
        <div key={g.name}>
          <h3 className="text-lg">{g.name}</h3>
          <Stagger as="ul" className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.tests.map((attempts) => (
              <StaggerItem as="li" key={attempts[0].testId}>
                <ResultCard attempts={attempts} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      ))}
    </div>
  );
}
