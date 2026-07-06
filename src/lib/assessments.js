// Evidence-based self-report screeners (public domain / freely usable instruments).
// These are screening tools, NOT diagnostic instruments.

const FREQ_0_3 = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

const PSS_0_4 = [
  { label: "Never", value: 0 },
  { label: "Almost never", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Fairly often", value: 3 },
  { label: "Very often", value: 4 },
];

const WHO_0_5 = [
  { label: "At no time", value: 0 },
  { label: "Some of the time", value: 1 },
  { label: "Less than half of the time", value: 2 },
  { label: "More than half of the time", value: 3 },
  { label: "Most of the time", value: 4 },
  { label: "All of the time", value: 5 },
];

const TIPI_1_7 = [
  { label: "Disagree strongly", value: 1 },
  { label: "Disagree moderately", value: 2 },
  { label: "Disagree a little", value: 3 },
  { label: "Neither agree nor disagree", value: 4 },
  { label: "Agree a little", value: 5 },
  { label: "Agree moderately", value: 6 },
  { label: "Agree strongly", value: 7 },
];

export const assessments = [
  {
    id: "phq9",
    name: "Depression Check-in",
    subtitle: "PHQ-9",
    icon: "🌧️",
    minutes: 3,
    color: "from-indigo-500 to-blue-500",
    description:
      "The Patient Health Questionnaire-9 is the most widely used depression screening tool in the world, used by clinicians everywhere.",
    intro: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    options: FREQ_0_3,
    questions: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      "Trouble concentrating on things, such as reading or watching television",
      "Moving or speaking so slowly that other people could have noticed — or the opposite, being fidgety or restless",
      "Thoughts that you would be better off dead, or of hurting yourself in some way",
    ],
    // Question 9 (index 8) is the self-harm item — flag any non-zero answer.
    riskItemIndex: 8,
    bands: [
      { max: 4, level: "Minimal", tone: "good", advice: "Your responses suggest minimal symptoms of depression right now. Keep nurturing the habits that support you — sleep, movement, connection." },
      { max: 9, level: "Mild", tone: "ok", advice: "You may be experiencing mild symptoms. Gentle structure helps: regular sleep, small daily activities you enjoy, and talking to someone you trust. Consider re-checking in two weeks." },
      { max: 14, level: "Moderate", tone: "warn", advice: "Your responses suggest moderate symptoms. This is a good moment to talk with a doctor, counselor, or therapist — these symptoms respond well to treatment like CBT." },
      { max: 19, level: "Moderately severe", tone: "warn", advice: "Your responses suggest moderately severe symptoms. Please consider reaching out to a mental health professional soon. You deserve support, and effective help exists." },
      { max: 27, level: "Severe", tone: "alert", advice: "Your responses suggest severe symptoms. Please reach out to a mental health professional or your doctor as soon as you can. If you feel unsafe, contact a crisis line now — see the Resources page." },
    ],
  },
  {
    id: "gad7",
    name: "Anxiety Check-in",
    subtitle: "GAD-7",
    icon: "🌪️",
    minutes: 2,
    color: "from-teal-500 to-emerald-500",
    description:
      "The Generalized Anxiety Disorder-7 scale is a validated screener for anxiety severity used in clinics worldwide.",
    intro: "Over the last 2 weeks, how often have you been bothered by the following problems?",
    options: FREQ_0_3,
    questions: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid, as if something awful might happen",
    ],
    bands: [
      { max: 4, level: "Minimal", tone: "good", advice: "Minimal anxiety symptoms right now. A little anxiety is a normal, useful part of being human." },
      { max: 9, level: "Mild", tone: "ok", advice: "Mild anxiety symptoms. Breathing exercises, regular movement, and limiting caffeine can genuinely help. Try the Breathe page." },
      { max: 14, level: "Moderate", tone: "warn", advice: "Moderate anxiety symptoms. Consider talking to a professional — anxiety is one of the most treatable conditions, and CBT has strong evidence behind it." },
      { max: 21, level: "Severe", tone: "alert", advice: "Severe anxiety symptoms. Please consider reaching out to a mental health professional. In the meantime, grounding and breathing exercises can help you through intense moments." },
    ],
  },
  {
    id: "pss10",
    name: "Stress Level",
    subtitle: "PSS-10",
    icon: "⚡",
    minutes: 3,
    color: "from-amber-500 to-orange-500",
    description:
      "The Perceived Stress Scale measures how unpredictable, uncontrollable, and overloaded you find your life.",
    intro: "In the last month, how often have you felt or thought the following?",
    options: PSS_0_4,
    reverseIndexes: [3, 4, 6, 7],
    questions: [
      "Been upset because of something that happened unexpectedly?",
      "Felt that you were unable to control the important things in your life?",
      "Felt nervous and 'stressed'?",
      "Felt confident about your ability to handle your personal problems?",
      "Felt that things were going your way?",
      "Found that you could not cope with all the things that you had to do?",
      "Been able to control irritations in your life?",
      "Felt that you were on top of things?",
      "Been angered because of things that were outside of your control?",
      "Felt difficulties were piling up so high that you could not overcome them?",
    ],
    bands: [
      { max: 13, level: "Low stress", tone: "good", advice: "Your perceived stress is low. Your coping resources currently feel bigger than your demands — a great place to be." },
      { max: 26, level: "Moderate stress", tone: "warn", advice: "Moderate perceived stress. Look at what you can control: boundaries, sleep, and micro-breaks. The Journal's stress prompts may help you untangle what's weighing on you." },
      { max: 40, level: "High stress", tone: "alert", advice: "High perceived stress. Chronic stress affects sleep, mood, and health — please prioritize recovery, and consider talking to someone about workload or life pressures." },
    ],
  },
  {
    id: "who5",
    name: "Wellbeing Index",
    subtitle: "WHO-5",
    icon: "🌿",
    minutes: 1,
    color: "from-emerald-500 to-lime-500",
    description:
      "The World Health Organization's 5-item wellbeing index — one of the most widely used measures of subjective wellbeing.",
    intro: "Over the last two weeks…",
    options: WHO_0_5,
    scale: (raw) => raw * 4, // WHO-5 is reported as a 0–100 percentage
    questions: [
      "I have felt cheerful and in good spirits",
      "I have felt calm and relaxed",
      "I have felt active and vigorous",
      "I woke up feeling fresh and rested",
      "My daily life has been filled with things that interest me",
    ],
    bands: [
      { max: 28, level: "Low wellbeing", tone: "alert", advice: "A score below 50 suggests low wellbeing, and below 28 is often used as a screen for depression. Please consider a Depression Check-in and reaching out for support." },
      { max: 49, level: "Below average", tone: "warn", advice: "Your wellbeing is below the typical range. Small consistent actions — daylight, movement, one enjoyable thing per day — measurably move this number." },
      { max: 100, level: "Good wellbeing", tone: "good", advice: "Your wellbeing is in a healthy range. Notice what's working in your life right now — naming it helps protect it." },
    ],
  },
  {
    id: "tipi",
    name: "Personality Snapshot",
    subtitle: "TIPI · Big Five",
    icon: "🧬",
    minutes: 2,
    color: "from-fuchsia-500 to-purple-500",
    description:
      "The Ten-Item Personality Inventory gives a quick snapshot of the Big Five traits: openness, conscientiousness, extraversion, agreeableness, and emotional stability.",
    intro: "I see myself as:",
    options: TIPI_1_7,
    type: "personality",
    questions: [
      "Extraverted, enthusiastic",
      "Critical, quarrelsome",
      "Dependable, self-disciplined",
      "Anxious, easily upset",
      "Open to new experiences, complex",
      "Reserved, quiet",
      "Sympathetic, warm",
      "Disorganized, careless",
      "Calm, emotionally stable",
      "Conventional, uncreative",
    ],
  },
];

export function scoreAssessment(assessment, answers) {
  if (assessment.type === "personality") return scoreTipi(answers);

  let total = 0;
  answers.forEach((v, i) => {
    if (assessment.reverseIndexes?.includes(i)) {
      const maxVal = Math.max(...assessment.options.map((o) => o.value));
      total += maxVal - v;
    } else {
      total += v;
    }
  });
  if (assessment.scale) total = assessment.scale(total);

  const band =
    assessment.bands.find((b) => total <= b.max) ??
    assessment.bands[assessment.bands.length - 1];

  const maxScore = assessment.scale
    ? assessment.scale(Math.max(...assessment.options.map((o) => o.value)) * assessment.questions.length)
    : Math.max(...assessment.options.map((o) => o.value)) * assessment.questions.length;

  const riskFlag =
    assessment.riskItemIndex !== undefined && answers[assessment.riskItemIndex] > 0;

  return { score: total, maxScore, band, riskFlag };
}

const TIPI_TRAITS = [
  { key: "Extraversion", items: [0, 5], reverse: [5], blurb: { high: "You draw energy from people and stimulation.", low: "You recharge in quiet — depth over breadth." } },
  { key: "Agreeableness", items: [6, 1], reverse: [1], blurb: { high: "Warm and cooperative; harmony matters to you.", low: "Direct and competitive; you say the hard thing." } },
  { key: "Conscientiousness", items: [2, 7], reverse: [7], blurb: { high: "Organized and reliable; you finish what you start.", low: "Flexible and spontaneous; structure can feel confining." } },
  { key: "Emotional Stability", items: [8, 3], reverse: [3], blurb: { high: "You stay steady under pressure.", low: "You feel things intensely — sensitivity is also empathy." } },
  { key: "Openness", items: [4, 9], reverse: [9], blurb: { high: "Curious and imaginative; you seek new ideas.", low: "Practical and grounded; you value the proven." } },
];

export function scoreTipi(answers) {
  const traits = TIPI_TRAITS.map((t) => {
    const vals = t.items.map((i) => (t.reverse.includes(i) ? 8 - answers[i] : answers[i]));
    const score = (vals[0] + vals[1]) / 2; // 1–7
    return {
      trait: t.key,
      score,
      percent: Math.round(((score - 1) / 6) * 100),
      blurb: score >= 4 ? t.blurb.high : t.blurb.low,
    };
  });
  return { type: "personality", traits };
}
