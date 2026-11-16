import { Children } from "react";
import { Link } from "react-router-dom";
import { CONSENT_VERSION, MIN_AGE } from "../lib/config";
import { PageHeader } from "../components/ui";

// The table of contents is read from the <S id title> sections passed as children.
function Doc({ title, intro, children }) {
  const toc = Children.toArray(children).map((c) => [c.props.id, c.props.title]);
  return (
    <div className="mx-auto max-w-[62rem]">
      <PageHeader title={title} lead={intro}>
        <p className="mt-4 text-sm text-ink-3">Last updated {new Date(CONSENT_VERSION).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </PageHeader>
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-16">
        <nav aria-label="On this page" className="well no-print mb-10 p-4 lg:sticky lg:top-28 lg:mb-0 lg:bg-transparent lg:p-0">
          <p className="eyebrow mb-1 px-2 lg:mb-2">On this page</p>
          <ol>
            {toc.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="flex min-h-11 items-center rounded-[var(--r-sm)] px-2 text-sm font-medium text-ink-3 transition-colors hover:bg-sunken hover:text-ink lg:min-h-10">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="prose-lesson grid gap-12">{children}</article>
      </div>
    </div>
  );
}

const S = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-28">
    <h2 className="mb-4 text-[1.75rem] sm:text-[2rem]">{title}</h2>
    <div className="[&>:last-child]:mb-0 [&_li]:ml-5 [&_li]:max-w-[66ch] [&_li]:list-disc [&_ul]:mb-[1.1rem] [&_ul]:space-y-2">{children}</div>
  </section>
);

const ContactLink = () => <Link to="/contact" className="link">contact form</Link>;

export function Privacy() {
  return (
    <Doc
      title="Privacy"
      intro="You can use every lesson and test without an account, and then nothing leaves your browser. An account is optional. We keep what it needs to work, nothing more, and we never sell data or show ads."
    >
      <S id="device" title="Without an account">
        <p>
          Your answers, results, lesson progress and chats are saved in your browser on your own device. They aren't sent to us. Clearing your browser
          data deletes them; Insights lets you download a backup first.
        </p>
      </S>

      <S id="account" title="With an account">
        <ul>
          <li><strong>Sign-in:</strong> your email address, and your password (stored only as a secure hash) or your Google sign-in. Needed to run your account.</li>
          <li><strong>Lesson progress:</strong> your best quiz score per lesson, so it follows you between devices.</li>
          <li><strong>Test results, only if you turn this on:</strong> some results relate to mental health, so we store them only with your explicit consent. Turning it off deletes them.</li>
          <li><strong>AI usage:</strong> a daily count of your AI requests, used for the daily limit and deleted after 30 days.</li>
        </ul>
        <p>Your individual answers to test questions never leave your device, with or without an account.</p>
      </S>

      <S id="ai" title="The AI assistant">
        <p>
          The AI is optional and needs an account. When you use it, your message, or the scores of a result you choose to explain, is sent to Google's
          Gemini service to write the reply. We never send your name or email. You agree to this with a checkbox before first use, and confirm again
          each time you send scores from a mood, personality-pattern or attention test. Please don't type details that identify you or anyone else.
          Google may keep requests for a limited time to prevent abuse and handles them under its Gemini API terms. Your chat history stays in your
          browser.
        </p>
      </S>

      <S id="stats" title="Visitor statistics and cookies">
        <p>
          We count page views with Vercel Web Analytics, which uses no cookies and doesn't identify or follow you. We don't use cookies at all. Your
          browser's local storage holds your sign-in session, your results and settings like dark mode, which the site needs to work. You can object to
          the statistics through the <ContactLink />.
        </p>
      </S>

      <S id="contact-form" title="Messages you send us">
        <p>If you use the <ContactLink />, we keep your message and the reply address you give (optional) to answer you, and delete them after a year.</p>
      </S>

      <S id="providers" title="Who helps us run the site">
        <ul>
          <li><strong>Vercel</strong> hosts the site and counts visits.</li>
          <li><strong>Supabase</strong> runs sign-in, the account database and the contact form, stored in Frankfurt, Germany.</li>
          <li><strong>Google</strong> provides Google sign-in (if you choose it) and the Gemini AI (if you use it).</li>
        </ul>
        <p>
          Some of these companies are based in the US. Data transfers are covered by the EU-US Data Privacy Framework or the European Commission's
          standard contractual clauses.
        </p>
      </S>

      <S id="rights" title="Your choices and rights">
        <p>
          Your <Link to="/account" className="link">account page</Link> lets you download everything we hold, turn result storage off, withdraw AI
          consent and delete your account in one step. Deleted data can stay in encrypted backups for up to 7 days. Under the GDPR you can also ask us
          to access, correct, restrict or transfer your data, or object to processing, through the <ContactLink />, and you can complain to your local
          data protection authority.
        </p>
        <p>Accounts are for people aged {MIN_AGE} and over.</p>
      </S>

      <S id="legal-bases" title="Legal bases (GDPR)">
        <p>
          Account and progress: performance of a contract (Art. 6(1)(b)). Stored results and AI use with health-related scores: your explicit consent
          (Art. 6(1)(a), 9(2)(a)). Usage limits, security, contact messages and visitor statistics: legitimate interests (Art. 6(1)(f)).
        </p>
      </S>
    </Doc>
  );
}

export function Terms() {
  return (
    <Doc title="Terms of use">
      <S id="what" title="What MindSpace is">
        <p>
          A free educational website about psychology: lessons, interactive versions of published research questionnaires, an IQ practice test and an
          AI learning assistant. Its purpose is education and self-reflection.
        </p>
      </S>

      <S id="not-medical" title="Not medical advice">
        <p>
          MindSpace is not a medical device or health service and is not intended to diagnose, prevent, monitor, treat or predict any condition.
          Questionnaire results show where your answers fall on a published research scale; they are not an assessment of you. The IQ test gives a
          practice estimate, not an official IQ score. Don't make health, education or job decisions based on results here. In a crisis, see{" "}
          <Link to="/help" className="link">Get help</Link>.
        </p>
      </S>

      <S id="accounts" title="Accounts and fair use">
        <p>
          You must be {MIN_AGE} or older to create an account and you're responsible for keeping it secure. Each account has a daily limit of AI
          requests, and the site has an overall daily limit; when a limit is reached the AI pauses until midnight UTC. Don't get around limits (for
          example with many accounts), overload or attack the service, or use the AI for harmful content. We may suspend accounts that do.
        </p>
      </S>

      <S id="ai" title="AI answers">
        <p>AI answers are generated automatically and can be wrong. They never change your scores.</p>
      </S>

      <S id="content" title="Content and liability">
        <p>
          Questionnaires are credited to their authors on each test page and used for non-commercial education. The service is free and provided as
          is; to the extent the law allows, we aren't liable for decisions based on it. Nothing here limits your statutory rights as a consumer.
        </p>
      </S>

      <S id="changes" title="Changes and contact">
        <p>We'll show the date of the latest version at the top. Questions: use the <ContactLink />.</p>
      </S>
    </Doc>
  );
}
