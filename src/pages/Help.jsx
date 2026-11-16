import { Link } from "react-router-dom";
import { crisisResources } from "../lib/safety";
import { Icon, PageHeader } from "../components/ui";

const STEPS = [
  ["Your doctor or GP", "A good first stop. They can rule out physical causes and refer you to a psychologist or psychiatrist."],
  ["A licensed therapist", "Look for a registered psychologist, counsellor or psychotherapist. In the US, the Psychology Today directory and your insurer's list are common starting points."],
  ["Campus or workplace support", "Universities and many employers offer free, confidential counselling (often called an Employee Assistance Programme)."],
  ["Low-cost options", "Community mental health centres, university training clinics and sliding-scale therapists charge less."],
];

// One-tap actions for each resource, keyed by its name in lib/safety.js. A resource with no entry still shows its text.
const ACTIONS = {
  "988 Suicide & Crisis Lifeline (US)": [["Call 988", "tel:988"], ["Text 988", "sms:988"]],
  "Crisis Text Line": [["Text 741741", "sms:741741?&body=HOME"], ["Text 85258", "sms:85258?&body=HOME"]],
  "Find a helpline (any country)": [["Open findahelpline.com", "https://findahelpline.com"]],
  "Emergency services": [["Call 911", "tel:911"], ["Call 112", "tel:112"]],
};

export default function Help() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Get help" lead="If you might hurt yourself or someone else, or you're in danger, contact one of these now. They're free and confidential." />

      <ul className="grid gap-4 sm:grid-cols-2" aria-label="Crisis lines">
        {crisisResources.map((r) => (
          <li key={r.name} className="card flex flex-col p-5 sm:p-6">
            <p className="text-[1.375rem] font-semibold leading-snug tracking-[-0.02em] text-ink">{r.contact}</p>
            <p className="mt-1.5 font-medium text-ink-2">{r.name}</p>
            <p className="mt-1 text-sm text-ink-3">{r.note}</p>
            {ACTIONS[r.name] && (
              <div className="mt-auto flex flex-wrap gap-2.5 pt-5">
                {ACTIONS[r.name].map(([label, href], i) => {
                  const web = href.startsWith("http");
                  return (
                    <a key={href} href={href} className={`btn ${i === 0 ? "btn-primary" : "btn-ghost"}`} {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {label}
                      {web && <Icon name="external" size={18} />}
                    </a>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ul>

      <section className="mt-16 md:mt-20">
        <h2 className="text-[2rem] sm:text-[2.5rem]">When it isn't an emergency</h2>
        <p className="lead mt-3">If a result here worried you, or something has been hard for a while, these are good places to start.</p>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {STEPS.map(([t, d]) => (
            <div key={t} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <dt className="font-semibold text-ink">{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 max-w-[66ch]">
          Bring your result if it helps you explain what's going on, but describe what you experience in your own words. That matters more than any score.
          Need to settle first? Try the <Link to="/breathe" className="link">breathing exercise</Link>.
        </p>
      </section>
    </div>
  );
}
