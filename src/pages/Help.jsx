import { Link } from "react-router-dom";
import { crisisResources } from "../lib/safety";

const STEPS = [
  ["Your doctor or GP", "A good first stop. They can rule out physical causes and refer you to a psychologist or psychiatrist."],
  ["A licensed therapist", "Look for a registered psychologist, counsellor or psychotherapist. In the US, the Psychology Today directory and your insurer's list are common starting points."],
  ["Campus or workplace support", "Universities and many employers offer free, confidential counselling (often called an Employee Assistance Programme)."],
  ["Low-cost options", "Community mental health centres, university training clinics and sliding-scale therapists charge less."],
];

export default function Help() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-4xl sm:text-5xl font-semibold">Get help</h1>
      <p className="mt-3 text-lg text-ink-2">If you might hurt yourself or someone else, or you're in danger, contact one of these now. They're free and confidential.</p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {crisisResources.map((r) => (
          <li key={r.name} className="panel p-5">
            <div className="text-xl font-bold">{r.contact}</div>
            <div className="mt-1 font-bold text-ink-2">{r.name}</div>
            <p className="mt-1 text-sm text-ink-2">{r.note}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl font-semibold">When it isn't an emergency</h2>
      <p className="mt-2 text-ink-2">If a result here worried you, or something has been hard for a while, these are good places to start.</p>
      <dl className="mt-6 divide-y divide-line border-y border-line">
        {STEPS.map(([t, d]) => (
          <div key={t} className="py-4">
            <dt className="font-bold">{t}</dt>
            <dd className="mt-1 text-ink-2">{d}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-ink-2">
        Bring your result if it helps you explain what's going on, but describe what you experience in your own words. That matters more than any score.
        Need to settle first? Try the <Link to="/breathe" className="link">breathing exercise</Link>.
      </p>
    </div>
  );
}
