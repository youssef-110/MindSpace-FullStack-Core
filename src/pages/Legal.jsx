import { Link } from "react-router-dom";
import { CONTACT_EMAIL, CONSENT_VERSION, MIN_AGE, OPERATOR } from "../lib/config";

function Doc({ title, children }) {
  return (
    <article className="mx-auto max-w-3xl py-10">
      <h1 className="text-4xl sm:text-5xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-ink-2">Last updated {new Date(CONSENT_VERSION).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      <div className="legal mt-8 space-y-8">{children}</div>
    </article>
  );
}

const S = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-2xl font-bold mb-3">{title}</h2>
    <div className="space-y-3 text-[1.0rem] leading-relaxed [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{children}</div>
  </section>
);

const Mail = () => <a className="link break-all" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export function Privacy() {
  return (
    <Doc title="Privacy policy">
      <p className="text-lg">
        Short version: you can use every lesson and test without an account, and then your data stays in your browser. If you create an account,
        we store only what's needed to run it. Test results are stored in your account only if you explicitly agree. We don't sell data, show ads or
        use tracking cookies.
      </p>

      <S id="controller" title="Who is responsible">
        <p>
          The controller under the EU General Data Protection Regulation (GDPR) is {OPERATOR.name}, {OPERATOR.address}, {OPERATOR.country}. Contact for any
          privacy question or request: <Mail />. See also the <Link to="/imprint" className="link">imprint</Link>.
        </p>
      </S>

      <S id="without-account" title="Using MindSpace without an account">
        <p>
          Your answers, results, lesson progress and AI chats are saved in your browser's local storage on your device. They are not sent to us.
          You can delete them by clearing your browser data, and you can download a backup from My results.
        </p>
        <p>Your answers to individual questions never leave your device. Only the computed scores do, and only when you ask the AI to explain them.</p>
      </S>

      <S id="account" title="If you create an account">
        <ul>
          <li><strong>Account data:</strong> email address, a securely hashed password, sign-in timestamps. Purpose: providing your account. Legal basis: performance of a contract (Art. 6(1)(b) GDPR).</li>
          <li><strong>Lesson progress:</strong> best quiz score per lesson. Purpose: showing your progress on any device. Legal basis: Art. 6(1)(b).</li>
          <li><strong>Test results (optional):</strong> scores and result labels for tests you took. Some of these relate to mental health and count as special-category data. We store them only with your explicit consent (Art. 9(2)(a) and Art. 6(1)(a) GDPR), which you give with a separate checkbox and can withdraw at any time in your account. Withdrawing deletes the stored results.</li>
          <li><strong>AI usage counters:</strong> how many AI requests your account made per day. Purpose: fair daily limits and protecting the service from abuse. Legal basis: legitimate interest (Art. 6(1)(f)). Deleted after 30 days.</li>
        </ul>
      </S>

      <S id="ai" title="AI explanations and chat">
        <p>
          The AI features are optional and need an account. When you ask a question or request an explanation, we send your message, or the computed
          scores of that one result, and any results you chose to share with "Use my latest results", to Google's Gemini API, which generates the
          reply. We send no name or email. Please don't type information that identifies you or anyone else into the chat.
        </p>
        <p>
          Legal basis: your request (Art. 6(1)(b)) and your explicit consent (Art. 6(1)(a) and 9(2)(a)), which you give with an unticked checkbox before
          first use, and again each time you send scores from a mood, personality-pattern or attention test. You can withdraw it in your account.
        </p>
        <p>
          The recipient is Google LLC (USA), through the Gemini API. Google may keep requests for a limited period to detect abuse and, depending on the
          service tier, may use them to improve its services; see Google's Gemini API terms. We don't store the content of AI conversations on our
          servers; your chat history stays in your browser.
        </p>
      </S>

      <S id="analytics" title="Visitor statistics">
        <p>
          We use Vercel Web Analytics to count page views. It uses no cookies and stores nothing on your device; visitors are not identified or
          followed across sites, and the data is aggregated. Legal basis: legitimate interest in understanding which pages are useful (Art. 6(1)(f)).
          You can object to this at any time (Art. 21 GDPR) by emailing us, or by blocking scripts from this site's /_vercel/insights path.
        </p>
      </S>

      <S id="storage" title="Cookies and local storage">
        <p>We don't use cookies. We use your browser's local storage for things the site needs to work:</p>
        <ul>
          <li>your sign-in session (only if you sign in);</li>
          <li>your results, progress, chat history and unfinished tests;</li>
          <li>your light or dark theme, and whether you've seen the AI notice.</li>
        </ul>
        <p>These are strictly necessary for features you ask for, so no consent banner is required (Art. 5(3) ePrivacy Directive).</p>
      </S>

      <S id="processors" title="Service providers">
        <ul>
          <li><strong>Vercel Inc., USA</strong> (hosting and visitor statistics). Servers process requests, including your IP address, to deliver the site. Technical logs are kept for a short time (hours to a few days). Transfer basis: EU-US Data Privacy Framework and Standard Contractual Clauses.</li>
          <li><strong>Supabase Inc., USA</strong> (account database and sign-in). Data is stored in the EU (Frankfurt, Germany). Transfer basis for any access from outside the EU: Standard Contractual Clauses.</li>
          <li><strong>Google LLC, USA</strong> (Gemini API, only when you use the AI, see above). Transfer basis: EU-US Data Privacy Framework.</li>
        </ul>
        <p>Vercel and Supabase process data on our behalf under data processing agreements (Art. 28 GDPR).</p>
      </S>

      <S id="retention" title="How long we keep data">
        <ul>
          <li>Account, progress and consented results: until you delete them or your account. Deleted data can remain in our database provider's encrypted backups for up to 7 days.</li>
          <li>AI usage counters: 30 days.</li>
          <li>Data on your device: until you clear it.</li>
        </ul>
      </S>

      <S id="rights" title="Your rights">
        <p>
          You have the right to access, correct, delete and export your data, to restrict or object to processing, and to withdraw consent at any time
          without affecting earlier processing (Art. 15-21 and 7(3) GDPR). Most of this is built in: your <Link to="/account" className="link">account page</Link>{" "}
          lets you download all your data, turn result storage off, and delete your account. For anything else, email <Mail />. We answer within one month.
        </p>
        <p>You can also complain to the data protection authority in the EU country where you live or work.</p>
      </S>

      <S id="age" title="Age">
        <p>Accounts are for people aged {MIN_AGE} and over.</p>
      </S>

      <S id="security" title="Security">
        <p>
          Connections are encrypted (HTTPS). Every database table is protected so that an account can only ever read its own rows. Passwords are
          hashed by our sign-in provider and never visible to us.
        </p>
      </S>

      <S id="changes" title="Changes">
        <p>If we change this policy in a way that affects consent you gave, we'll ask you again before relying on the change.</p>
      </S>
    </Doc>
  );
}

export function Imprint() {
  return (
    <Doc title="Imprint">
      <S id="operator" title="Operator">
        <p>
          {OPERATOR.name}
          <br />
          {OPERATOR.address}
          <br />
          {OPERATOR.country}
        </p>
        <p>Email: <Mail /></p>
      </S>
      <S id="content" title="Responsible for content">
        <p>{OPERATOR.name}, address as above.</p>
      </S>
      <S id="disputes" title="Disputes">
        <p>MindSpace is a free, non-commercial educational service. We are not obliged or willing to take part in dispute resolution proceedings before a consumer arbitration board.</p>
      </S>
    </Doc>
  );
}

export function Terms() {
  return (
    <Doc title="Terms of use">
      <S id="what" title="What MindSpace is">
        <p>
          MindSpace is a free educational website about psychology. It offers lessons, interactive versions of published research questionnaires, a
          reasoning practice test and an AI learning assistant. Its purpose is education and self-reflection.
        </p>
      </S>

      <S id="not-medical" title="Not medical advice or diagnosis">
        <p>
          MindSpace is not a medical device and not a health service. It is not intended to diagnose, prevent, monitor, predict, treat or alleviate any
          disease or condition. Questionnaire results show where your answers fall on a published research scale; they are not an assessment of you. The
          reasoning test gives a practice estimate, not a validated IQ score. Don't make health, educational or employment decisions based on results here.
        </p>
        <p>
          If you're in crisis, contact emergency services or a crisis line. See <Link to="/help" className="link">Get help</Link>.
        </p>
      </S>

      <S id="accounts" title="Accounts">
        <p>
          You must be {MIN_AGE} or older to create an account. Keep your password private; you're responsible for activity on your account. You can delete
          your account at any time from your account page.
        </p>
      </S>

      <S id="ai" title="The AI assistant">
        <p>
          AI answers are generated automatically and can be wrong or incomplete. Each account has a daily limit of AI requests, and the site has an
          overall daily limit; when a limit is reached the AI pauses until it resets at midnight UTC. Lessons and tests keep working.
        </p>
      </S>

      <S id="use" title="Acceptable use">
        <ul>
          <li>Don't try to get around usage limits, for example by creating many accounts.</li>
          <li>Don't attack, overload, scrape at scale or reverse-engineer the service.</li>
          <li>Don't use the AI to produce harmful, illegal or harassing content.</li>
        </ul>
        <p>We may suspend accounts that break these rules.</p>
      </S>

      <S id="content" title="Content">
        <p>
          Lessons, design and code belong to MindSpace. The questionnaires are published research instruments, credited to their authors on each test
          page and used under their terms for non-commercial, educational purposes.
        </p>
      </S>

      <S id="liability" title="Liability">
        <p>
          The service is provided free of charge and as is. To the extent permitted by law, we are not liable for decisions made on the basis of
          content or results on this site. Nothing in these terms limits liability that cannot be limited by law, including your statutory rights as
          a consumer in the EU.
        </p>
      </S>

      <S id="changes" title="Changes">
        <p>We may update these terms. We'll show the date of the latest version at the top. Questions: <Mail />.</p>
      </S>
    </Doc>
  );
}
