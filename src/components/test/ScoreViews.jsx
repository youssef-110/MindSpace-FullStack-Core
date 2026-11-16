import { Meter, TONE } from "../ui";
import { BellCurve, PercentileBar } from "./ResultCharts";

const toneOf = (t) => TONE[t] ?? TONE.ok;
const BAND = { low: "Lower end", mid: "Middle", high: "Higher end" };
const ordinal = (n) => {
  const v = Math.round(n);
  const m = v % 100;
  return v + (m > 10 && m < 14 ? "th" : ["th", "st", "nd", "rd"][v % 10] ?? "th");
};

function Percentile({ value, note }) {
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="font-semibold text-ink">{ordinal(value)} percentile</p>
      <PercentileBar value={value} />
      {note && <p className="text-sm text-ink-3">{note}</p>}
    </div>
  );
}

function Scale({ min, max }) {
  return (
    <div className="num mt-2 flex justify-between text-xs text-ink-3" aria-hidden="true">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  );
}

function Sum({ r }) {
  const tone = toneOf(r.band.tone);
  const min = r.min ?? 0;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`tag ${tone.tag} px-3 py-2 text-sm`}>{r.band.level}</span>
        <span className="num text-sm text-ink-3">{r.unit ? `${r.score} ${r.unit}` : `${r.score} / ${r.max}`}</span>
      </div>
      {Number.isFinite(r.max) && (
        <div className="mt-5">
          <Meter value={r.score} min={min} max={r.max} color={tone.color} label={`${r.score} on a scale from ${min} to ${r.max}`} />
          <Scale min={min} max={r.max} />
        </div>
      )}
      <p className="mt-5 text-lg text-ink">{r.band.text}</p>
      {r.metrics?.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {r.metrics.map((m) => (
            <div key={m.label} className="well flex flex-col-reverse p-4">
              <dt className="mt-1 text-sm text-ink-3">{m.label}</dt>
              <dd className="num text-xl font-semibold text-ink">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {Number.isFinite(r.percentile) && <Percentile value={r.percentile} note={r.normNote} />}
    </div>
  );
}

function Traits({ r, prev }) {
  const [first] = r.traits;
  const sameScale = first.min !== undefined && r.traits.every((t) => t.min === first.min && t.max === first.max);
  const scaleNote = sameScale ? `Scores run from ${first.min} to ${first.max}, with ${(first.min + first.max) / 2} in the middle. ` : "";
  const ranked = r.traits.some((t) => Number.isFinite(t.percentile));
  return (
    <div>
      <ul className="grid gap-7">
        {r.traits.map((t) => {
          const min = t.min ?? 10; // results saved before traits carried their own scale were all 10 to 50
          const max = t.max ?? 50;
          const tone = t.level ? toneOf(t.tone) : null;
          const before = prev?.traits?.find((p) => p.key === t.key)?.score;
          const diff = before === undefined ? 0 : Math.round((t.score - before) * 100) / 100;
          return (
            <li key={t.key}>
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                <h3 className="text-lg">{t.name}</h3>
                <div className="flex items-center gap-2.5">
                  <span className={`tag ${tone?.tag ?? ""}`}>{t.level ?? BAND[t.band] ?? t.band}</span>
                  <span className="num font-semibold text-ink">{t.score}<span className="font-normal text-ink-3"> / {max}</span></span>
                </div>
              </div>
              <Meter value={t.score} min={min} max={max} color={tone?.color} label={`${t.name}: ${t.score} on a ${min} to ${max} scale`} />
              <p className="mt-3">{t.note}</p>
              {(Number.isFinite(t.percentile) || diff !== 0) && (
                <p className="num mt-1 text-sm text-ink-3">
                  {[Number.isFinite(t.percentile) && `${ordinal(t.percentile)} percentile`, diff !== 0 && `${diff > 0 ? "Up" : "Down"} ${Math.abs(diff)} since last time`].filter(Boolean).join(" · ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {(scaleNote || !ranked || r.normNote) && (
        <p className="mt-7 border-t border-line pt-5 text-sm text-ink-3">
          {scaleNote}
          {r.normNote ?? (!ranked && "These describe your answers, not how you rank against other people.")}
        </p>
      )}
    </div>
  );
}

function Threshold({ test, r }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`tag ${r.positive ? "tag-warn" : ""} px-3 py-2 text-sm`}>{r.positive ? "At or above the research cut-off" : "Below the research cut-off"}</span>
        <span className="num text-sm text-ink-3">{r.score} / {r.max}</span>
      </div>
      <div className="mt-6">
        <Meter value={r.score} max={r.max} cutoff={r.cutoff} label={`${r.score} of ${r.max}, threshold ${r.cutoff}`} />
        <Scale min={0} max={r.max} />
      </div>
      <p className="mt-2 text-sm text-ink-3">The line marks the cut-off of {r.cutoff} used in the original research.</p>
      <p className="mt-5 text-lg text-ink">
        {r.positive
          ? test.sensitive
            ? "Your score is at or above the cut-off the authors used. In their studies, people scoring this high were more often found to have long-standing personality difficulties when a clinician assessed them, but many were not, especially during stress, low mood or big life changes. A questionnaire can't tell which applies to you."
            : "Your score is at or above the cut-off the authors used in their research. In their studies, people scoring this high were more likely to meet criteria when assessed by a clinician, but this score is not an assessment of you."
          : test.sensitive
            ? "Your score is below the cut-off the authors used. If something still troubles you, that matters more than any score."
            : "Your score is below the cut-off the authors used in their research. Questionnaires like this miss some people, so a low score doesn't rule anything out."}
      </p>
    </div>
  );
}

function Matrix({ r }) {
  return (
    <div>
      <BellCurve low={r.low} high={r.high} estimate={r.estimate} />
      <p className="mt-5">
        The shaded band is a 90% range. On this scale, 100 is the intended average and two in three people fall between 85 and 115. Because our
        puzzle difficulties are design estimates rather than measured on a norm group, read this as a practice estimate, not your IQ.
      </p>
    </div>
  );
}

// The interpretation of a result, for every shape a test can produce. `prev` is the previous result of the same test.
export default function ScoreView({ test, r, prev }) {
  if (r.type === "sum") return <Sum r={r} />;
  if (r.type === "traits") return <Traits r={r} prev={prev} />;
  if (r.type === "threshold") return <Threshold test={test} r={r} />;
  if (r.type === "matrix") return <Matrix r={r} />;
  return null;
}
