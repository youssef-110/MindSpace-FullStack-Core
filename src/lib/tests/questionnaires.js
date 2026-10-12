// Questionnaire definitions and deterministic scoring. Every instrument here is a published,
// freely usable measure reproduced with its original wording, keying and cutoffs.
// Scores are computed only here — the AI never decides a score, band or label.

const FREQ_0_3 = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
const PSS_0_4 = ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"];
const WHO_0_5 = ["At no time", "Some of the time", "Less than half of the time", "More than half of the time", "Most of the time", "All of the time"];
const ACCURATE_1_5 = ["Very inaccurate", "Moderately inaccurate", "Neither", "Moderately accurate", "Very accurate"];
const AGREE_4 = ["Strongly agree", "Agree", "Disagree", "Strongly disagree"];
const AQ_4 = ["Definitely agree", "Slightly agree", "Slightly disagree", "Definitely disagree"];
const ASRS_0_4 = ["Never", "Rarely", "Sometimes", "Often", "Very often"];
const YES_NO = ["No", "Yes"];

// ---------------- IPIP Big-Five Factor Markers (50 items, Goldberg 1992, public domain) ----------------
// [text, trait, keying]. Trait N is scored as Neuroticism (the reverse of IPIP "Emotional Stability").
const IPIP50 = [
  ["Am the life of the party.", "E", 1], ["Feel little concern for others.", "A", -1], ["Am always prepared.", "C", 1], ["Get stressed out easily.", "N", 1], ["Have a rich vocabulary.", "O", 1],
  ["Don't talk a lot.", "E", -1], ["Am interested in people.", "A", 1], ["Leave my belongings around.", "C", -1], ["Am relaxed most of the time.", "N", -1], ["Have difficulty understanding abstract ideas.", "O", -1],
  ["Feel comfortable around people.", "E", 1], ["Insult people.", "A", -1], ["Pay attention to details.", "C", 1], ["Worry about things.", "N", 1], ["Have a vivid imagination.", "O", 1],
  ["Keep in the background.", "E", -1], ["Sympathize with others' feelings.", "A", 1], ["Make a mess of things.", "C", -1], ["Seldom feel blue.", "N", -1], ["Am not interested in abstract ideas.", "O", -1],
  ["Start conversations.", "E", 1], ["Am not interested in other people's problems.", "A", -1], ["Get chores done right away.", "C", 1], ["Am easily disturbed.", "N", 1], ["Have excellent ideas.", "O", 1],
  ["Have little to say.", "E", -1], ["Have a soft heart.", "A", 1], ["Often forget to put things back in their proper place.", "C", -1], ["Get upset easily.", "N", 1], ["Do not have a good imagination.", "O", -1],
  ["Talk to a lot of different people at parties.", "E", 1], ["Am not really interested in others.", "A", -1], ["Like order.", "C", 1], ["Change my mood a lot.", "N", 1], ["Am quick to understand things.", "O", 1],
  ["Don't like to draw attention to myself.", "E", -1], ["Take time out for others.", "A", 1], ["Shirk my duties.", "C", -1], ["Have frequent mood swings.", "N", 1], ["Use difficult words.", "O", 1],
  ["Don't mind being the center of attention.", "E", 1], ["Feel others' emotions.", "A", 1], ["Follow a schedule.", "C", 1], ["Get irritated easily.", "N", 1], ["Spend time reflecting on things.", "O", 1],
  ["Am quiet around strangers.", "E", -1], ["Make people feel at ease.", "A", 1], ["Am exacting in my work.", "C", 1], ["Often feel blue.", "N", 1], ["Am full of ideas.", "O", 1],
];

export const TRAITS = {
  O: { name: "Intellect / Openness", low: "You prefer the concrete and familiar; practical over abstract.", high: "You enjoy ideas, imagination and abstract thinking." },
  C: { name: "Conscientiousness", low: "You lean flexible and spontaneous; structure can feel confining.", high: "You lean organised, prepared and dependable." },
  E: { name: "Extraversion", low: "You lean reserved; you recharge with quiet and smaller groups.", high: "You lean outgoing; people and activity energise you." },
  A: { name: "Agreeableness", low: "You lean direct and sceptical; you put task before harmony.", high: "You lean warm, trusting and considerate of others." },
  N: { name: "Neuroticism", low: "You tend to stay calm and recover from stress quickly.", high: "You feel worry, irritation and low mood more readily." },
};

export const CATEGORIES = [
  { id: "personality", name: "Personality", blurb: "Stable patterns in how you think, feel and act." },
  { id: "cognitive", name: "Reasoning", blurb: "Pattern-finding under time pressure." },
  { id: "patterns", name: "Personality patterns", blurb: "Screeners for long-standing difficulties. Not diagnoses." },
  { id: "wellbeing", name: "Mood & wellbeing", blurb: "How the last few weeks have been." },
  { id: "neuro", name: "Attention & social style", blurb: "Screeners for ADHD and autistic traits in adults." },
];

export const questionnaires = [
  {
    id: "big-five",
    category: "personality",
    name: "Big Five personality",
    instrument: "IPIP Big-Five Factor Markers, 50 items",
    minutes: 8,
    lesson: "big-five",
    measures: "Five broad traits: openness, conscientiousness, extraversion, agreeableness and neuroticism.",
    cannot: "It can't tell you your rank against other people (we don't use population norms), and it can't describe narrower facets like assertiveness vs. sociability.",
    source: "Goldberg, L. R. (1992). Psychological Assessment, 4, 26–42. Items from the public-domain International Personality Item Pool (ipip.ori.org). Reported reliabilities (α) ≈ .79–.87 per trait.",
    intro: "Describe yourself as you generally are now, not as you wish to be. How accurately does each statement describe you?",
    options: ACCURATE_1_5.map((label, i) => ({ label, value: i + 1 })),
    items: IPIP50.map(([text]) => text),
    scoring: { type: "traits", keys: IPIP50.map(([, trait, sign]) => ({ trait, sign })) },
  },
  {
    id: "self-esteem",
    category: "personality",
    name: "Self-esteem",
    instrument: "Rosenberg Self-Esteem Scale, 10 items",
    minutes: 2,
    lesson: "self-esteem",
    measures: "Your overall sense of self-worth: how much you value and accept yourself.",
    cannot: "It doesn't separate self-esteem in different areas (work, looks, relationships) and it shifts with mood.",
    source: "Rosenberg, M. (1965). Society and the Adolescent Self-Image. Princeton University Press. Public domain.",
    intro: "How much do you agree with each statement about how you generally feel about yourself?",
    options: AGREE_4.map((label, i) => ({ label, value: 3 - i })),
    items: [
      "On the whole, I am satisfied with myself.",
      "At times I think I am no good at all.",
      "I feel that I have a number of good qualities.",
      "I am able to do things as well as most other people.",
      "I feel I do not have much to be proud of.",
      "I certainly feel useless at times.",
      "I feel that I'm a person of worth, at least on an equal plane with others.",
      "I wish I could have more respect for myself.",
      "All in all, I am inclined to feel that I am a failure.",
      "I take a positive attitude toward myself.",
    ],
    scoring: {
      type: "sum",
      reverse: [1, 4, 5, 7, 8],
      max: 30,
      bands: [
        { max: 14, level: "Lower self-esteem", tone: "warn", text: "Scores under 15 are often read as low self-esteem. That's common, and it can change — self-compassion practice and CBT both have good evidence." },
        { max: 25, level: "Typical range", tone: "ok", text: "Most adults score in this range: a generally accepting view of yourself with normal ups and downs." },
        { max: 30, level: "High self-esteem", tone: "good", text: "You report a consistently positive view of yourself." },
      ],
    },
  },
  {
    id: "matrix",
    category: "cognitive",
    name: "Matrix reasoning",
    instrument: "MindSpace matrices, 24 items, 20 minutes",
    minutes: 20,
    lesson: "intelligence",
    measures: "Fluid reasoning: spotting rules in unfamiliar visual patterns, the kind of task used in Raven's Progressive Matrices.",
    cannot: "It is a practice estimate, not a validated IQ score. Item difficulties come from the puzzle design, not from testing a norm group, and one 20-minute task can't cover memory, verbal or processing-speed abilities.",
    source: "Original items generated from rule blueprints in the style of Raven's matrices, with a balanced answer set (Hu et al., 2021, I-RAVEN). Scored with a Rasch model (EAP estimate).",
    items: [],
    scoring: { type: "matrix" },
  },
  {
    id: "sapas",
    category: "patterns",
    name: "Personality difficulties screen",
    instrument: "SAPAS, 8 items",
    minutes: 1,
    lesson: "personality-disorders",
    sensitive: true,
    measures: "Whether you report long-standing patterns that are common across personality disorders in general.",
    cannot: "It can't say which personality disorder, if any, applies. It was validated as a short interview in clinical settings; as a self-report in the general public it flags many people who would not meet criteria.",
    source: "Moran, P. et al. (2003). British Journal of Psychiatry, 183, 228–232. A score of 3+ identified a personality disorder with sensitivity .94 and specificity .85 in psychiatric patients.",
    intro: "Answer for how you are in general, across most of your adult life — not just recently.",
    options: YES_NO.map((label, i) => ({ label, value: i })),
    items: [
      "In general, do you have difficulty making and keeping friends?",
      "Would you normally describe yourself as a loner?",
      "In general, do you trust other people?",
      "Do you normally lose your temper easily?",
      "Are you normally an impulsive sort of person?",
      "Are you normally a worrier?",
      "In general, do you depend on others a lot?",
      "In general, are you a perfectionist?",
    ],
    scoring: { type: "threshold", counts: (v, i) => (i === 2 ? v === 0 : v === 1), cutoff: 3 },
  },
  {
    id: "msi-bpd",
    category: "patterns",
    name: "Emotional intensity screen",
    instrument: "McLean Screening Instrument for BPD (MSI-BPD), 10 items",
    minutes: 2,
    lesson: "personality-disorders",
    sensitive: true,
    riskItem: 1,
    measures: "Whether you report experiences linked with borderline personality disorder: unstable relationships and mood, impulsivity, emptiness and fear of abandonment.",
    cannot: "It is a screener, not a diagnosis. Depression, trauma, ADHD and ordinary stress can all raise the score, and many people above the cutoff do not have BPD.",
    source: "Zanarini, M. C. et al. (2003). Journal of Personality Disorders, 17, 568–573. A cutoff of 7 gave sensitivity .81 and specificity .85 in young adults.",
    intro: "Thinking about your adult life, answer yes or no.",
    options: YES_NO.map((label, i) => ({ label, value: i })),
    items: [
      "Have any of your closest relationships been troubled by a lot of arguments or repeated breakups?",
      "Have you deliberately hurt yourself physically (for example, punched yourself, cut yourself, burned yourself), or ever made a suicide attempt?",
      "Have you had at least two other problems with impulsivity (for example, eating binges and spending sprees, drinking too much and verbal outbursts)?",
      "Have you been extremely moody?",
      "Have you felt very angry a lot of the time, or often acted in an angry or sarcastic manner?",
      "Have you often been distrustful of other people?",
      "Have you frequently felt unreal, or as if things around you were unreal?",
      "Have you chronically felt empty?",
      "Have you often felt that you had no idea of who you are, or that you have no identity?",
      "Have you made desperate efforts to avoid feeling abandoned or being abandoned (for example, repeatedly calling someone for reassurance, begging them not to leave)?",
    ],
    scoring: { type: "threshold", counts: (v) => v === 1, cutoff: 7 },
  },
  {
    id: "phq9",
    category: "wellbeing",
    name: "Low mood check",
    instrument: "PHQ-9, 9 items",
    minutes: 2,
    lesson: "depression",
    riskItem: 8,
    measures: "How much symptoms of depression have bothered you over the last two weeks.",
    cannot: "It can't diagnose depression; a clinician also rules out other causes such as grief, illness or medication.",
    source: "Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). Journal of General Internal Medicine, 16, 606–613. Free to use (Pfizer).",
    intro: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    options: FREQ_0_3.map((label, i) => ({ label, value: i })),
    items: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      "Trouble concentrating on things, such as reading the newspaper or watching television",
      "Moving or speaking so slowly that other people could have noticed, or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      "Thoughts that you would be better off dead, or of hurting yourself in some way",
    ],
    scoring: {
      type: "sum",
      max: 27,
      bands: [
        { max: 4, level: "Minimal", tone: "good", text: "Few symptoms right now. Keep up what supports you: sleep, movement and people." },
        { max: 9, level: "Mild", tone: "ok", text: "Some symptoms. Small daily structure helps. Check in again in two weeks." },
        { max: 14, level: "Moderate", tone: "warn", text: "Worth talking to a doctor or therapist. These symptoms respond well to treatment." },
        { max: 19, level: "Moderately severe", tone: "alert", text: "Please reach out to a professional soon. Effective help exists." },
        { max: 27, level: "Severe", tone: "alert", text: "Please contact a doctor or mental health professional as soon as you can." },
      ],
    },
  },
  {
    id: "gad7",
    category: "wellbeing",
    name: "Anxiety check",
    instrument: "GAD-7, 7 items",
    minutes: 2,
    lesson: "anxiety",
    measures: "How much symptoms of anxiety have bothered you over the last two weeks.",
    cannot: "It's built for generalised anxiety; it's less sensitive to panic, social anxiety or phobias, and it can't diagnose.",
    source: "Spitzer, R. L. et al. (2006). Archives of Internal Medicine, 166, 1092–1097. Free to use (Pfizer).",
    intro: "Over the last 2 weeks, how often have you been bothered by the following problems?",
    options: FREQ_0_3.map((label, i) => ({ label, value: i })),
    items: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid, as if something awful might happen",
    ],
    scoring: {
      type: "sum",
      max: 21,
      bands: [
        { max: 4, level: "Minimal", tone: "good", text: "Little anxiety right now. Some worry is a normal, useful part of life." },
        { max: 9, level: "Mild", tone: "ok", text: "Mild symptoms. Slow breathing, movement and less caffeine genuinely help." },
        { max: 14, level: "Moderate", tone: "warn", text: "Worth talking to a professional. Anxiety is very treatable; CBT has strong evidence." },
        { max: 21, level: "Severe", tone: "alert", text: "Please consider reaching out to a professional soon." },
      ],
    },
  },
  {
    id: "pss10",
    category: "wellbeing",
    name: "Stress level",
    instrument: "Perceived Stress Scale (PSS-10)",
    minutes: 2,
    lesson: "stress",
    measures: "How unpredictable, uncontrollable and overloaded your life has felt in the last month.",
    cannot: "It has no clinical cutoff. The bands below are a common convention, not official norms.",
    source: "Cohen, S., Kamarck, T., & Mermelstein, R. (1983). Journal of Health and Social Behavior, 24, 385–396.",
    intro: "In the last month, how often have you…",
    options: PSS_0_4.map((label, i) => ({ label, value: i })),
    items: [
      "been upset because of something that happened unexpectedly?",
      "felt that you were unable to control the important things in your life?",
      "felt nervous and stressed?",
      "felt confident about your ability to handle your personal problems?",
      "felt that things were going your way?",
      "found that you could not cope with all the things that you had to do?",
      "been able to control irritations in your life?",
      "felt that you were on top of things?",
      "been angered because of things that happened that were outside of your control?",
      "felt difficulties were piling up so high that you could not overcome them?",
    ],
    scoring: {
      type: "sum",
      reverse: [3, 4, 6, 7],
      max: 40,
      bands: [
        { max: 13, level: "Low", tone: "good", text: "Your resources currently feel bigger than your demands." },
        { max: 26, level: "Moderate", tone: "warn", text: "Look at what you can control: boundaries, sleep and short breaks." },
        { max: 40, level: "High", tone: "alert", text: "Chronic stress affects sleep, mood and health. Prioritise recovery and consider talking to someone." },
      ],
    },
  },
  {
    id: "who5",
    category: "wellbeing",
    name: "Wellbeing index",
    instrument: "WHO-5 Well-Being Index",
    minutes: 1,
    lesson: "wellbeing",
    measures: "Positive wellbeing over the last two weeks, on a 0–100 scale.",
    cannot: "It measures how good you've felt, not why. A low score is a prompt to look closer, not a diagnosis.",
    source: "World Health Organization (1998). Topp, C. W. et al. (2015). Psychotherapy and Psychosomatics, 84, 167–176. Free to use.",
    intro: "Over the last two weeks…",
    options: WHO_0_5.map((label, i) => ({ label, value: i })),
    items: [
      "I have felt cheerful and in good spirits",
      "I have felt calm and relaxed",
      "I have felt active and vigorous",
      "I woke up feeling fresh and rested",
      "My daily life has been filled with things that interest me",
    ],
    scoring: {
      type: "sum",
      multiplier: 4,
      max: 100,
      bands: [
        { max: 28, level: "Low", tone: "alert", text: "28 or below is a common screen for depression. Try the low mood check and consider talking to someone." },
        { max: 49, level: "Below 50", tone: "warn", text: "Under 50 suggests reduced wellbeing. Daylight, movement and one enjoyable thing a day measurably help." },
        { max: 100, level: "Good", tone: "good", text: "Your wellbeing is in a healthy range." },
      ],
    },
  },
  {
    id: "asrs",
    category: "neuro",
    name: "Adult ADHD screen",
    instrument: "ASRS v1.1 Part A, 6 items",
    minutes: 2,
    lesson: "adhd",
    measures: "Whether you report the inattention and restlessness most predictive of adult ADHD over the past six months.",
    cannot: "A diagnosis needs symptoms since childhood, in more than one setting, and a clinician ruling out anxiety, depression, sleep problems and more.",
    source: "Kessler, R. C. et al. (2005). Psychological Medicine, 35, 245–256. World Health Organization. Four or more marked answers is consistent with adult ADHD.",
    intro: "Over the past 6 months, how often…",
    options: ASRS_0_4.map((label, i) => ({ label, value: i })),
    items: [
      "…have you had trouble wrapping up the final details of a project, once the challenging parts have been done?",
      "…have you had difficulty getting things in order when you have to do a task that requires organization?",
      "…have you had problems remembering appointments or obligations?",
      "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
      "…do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
      "…do you feel overly active and compelled to do things, like you were driven by a motor?",
    ],
    scoring: { type: "threshold", counts: (v, i) => (i < 3 ? v >= 2 : v >= 3), cutoff: 4 },
  },
  {
    id: "aq10",
    category: "neuro",
    name: "Autistic traits screen",
    instrument: "AQ-10 (adult), 10 items",
    minutes: 2,
    lesson: "autism",
    measures: "Ten autistic traits, such as attention to detail and reading social cues.",
    cannot: "It's a quick referral screen. Many autistic adults score below 6, and many non-autistic people score above it.",
    source: "Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). Journal of the American Academy of Child & Adolescent Psychiatry, 51, 202–212. Autism Research Centre, Cambridge. A score of 6+ suggests considering a specialist assessment.",
    intro: "How much do you agree with each statement?",
    options: AQ_4.map((label, i) => ({ label, value: i })),
    items: [
      "I often notice small sounds when others do not.",
      "I usually concentrate more on the whole picture, rather than the small details.",
      "I find it easy to do more than one thing at once.",
      "If there is an interruption, I can switch back to what I was doing very quickly.",
      "I find it easy to 'read between the lines' when someone is talking to me.",
      "I know how to tell if someone listening to me is getting bored.",
      "When I'm reading a story I find it difficult to work out the characters' intentions.",
      "I like to collect information about categories of things (e.g. types of car, types of bird, types of train, types of plant).",
      "I find it easy to work out what someone is thinking or feeling just by looking at their face.",
      "I find it difficult to work out people's intentions.",
    ],
    // Items 1, 7, 8, 10 score on agreement; the rest on disagreement.
    scoring: { type: "threshold", counts: (v, i) => ([0, 6, 7, 9].includes(i) ? v <= 1 : v >= 2), cutoff: 6 },
  },
];

export const byId = (id) => questionnaires.find((q) => q.id === id);

// ---------------- Scoring ----------------

export function scoreQuestionnaire(q, answers) {
  if (answers.length !== q.items.length || answers.some((a) => a === undefined || a === null)) {
    throw new Error(`${q.id}: expected ${q.items.length} answers`);
  }
  const s = q.scoring;
  const riskFlag = q.riskItem !== undefined && answers[q.riskItem] > 0;

  if (s.type === "traits") {
    const traits = Object.keys(TRAITS).map((key) => {
      let score = 0;
      s.keys.forEach((k, i) => {
        if (k.trait === key) score += k.sign > 0 ? answers[i] : 6 - answers[i];
      });
      // 10 items × 1–5 = 10–50. Bands split the score range in thirds — a description of
      // your answers, not a population percentile.
      const band = score <= 23 ? "low" : score >= 37 ? "high" : "mid";
      return { key, name: TRAITS[key].name, score, min: 10, max: 50, band, note: band === "mid" ? "You sit near the middle: both descriptions fit you at times." : TRAITS[key][band] };
    });
    return { type: "traits", traits, riskFlag };
  }

  if (s.type === "sum") {
    const maxOpt = Math.max(...q.options.map((o) => o.value));
    const raw = answers.reduce((acc, v, i) => acc + (s.reverse?.includes(i) ? maxOpt - v : v), 0);
    const score = raw * (s.multiplier ?? 1);
    const band = s.bands.find((b) => score <= b.max) ?? s.bands.at(-1);
    return { type: "sum", score, max: s.max, band, riskFlag };
  }

  if (s.type === "threshold") {
    const marked = answers.map((v, i) => s.counts(v, i));
    const score = marked.filter(Boolean).length;
    return { type: "threshold", score, max: q.items.length, cutoff: s.cutoff, positive: score >= s.cutoff, riskFlag };
  }

  throw new Error(`Unknown scoring type ${s.type}`);
}
