// Evidence-based self-report screeners and psychometric instruments.
// DISCLAIMER: For psychoeducational screening and self-reflection only;
// does not replace formal clinical assessment or psychiatric diagnosis.

export const FREQ_0_3 = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

export const PSS_0_4 = [
  { label: "Never", value: 0 },
  { label: "Almost never", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Fairly often", value: 3 },
  { label: "Very often", value: 4 },
];

export const WHO_0_5 = [
  { label: "At no time", value: 0 },
  { label: "Some of the time", value: 1 },
  { label: "Less than half of the time", value: 2 },
  { label: "More than half of the time", value: 3 },
  { label: "Most of the time", value: 4 },
  { label: "All of the time", value: 5 },
];

export const TIPI_1_7 = [
  { label: "Disagree strongly", value: 1 },
  { label: "Disagree moderately", value: 2 },
  { label: "Disagree a little", value: 3 },
  { label: "Neither agree nor disagree", value: 4 },
  { label: "Agree a little", value: 5 },
  { label: "Agree moderately", value: 6 },
  { label: "Agree strongly", value: 7 },
];

export const LIKERT_1_5 = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral / Unsure", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
];

export const LIKERT_0_4 = [
  { label: "Not at all", value: 0 },
  { label: "A little", value: 1 },
  { label: "Moderately", value: 2 },
  { label: "A lot", value: 3 },
  { label: "Extremely", value: 4 },
];

export const BINARY_0_1 = [
  { label: "Does not describe me", value: 0 },
  { label: "Describes me well", value: 1 },
];

/* ==========================================================================
   MASTER ASSESSMENTS CATALOG
   Categories:
     - 'wellness': Mood & Anxiety (PHQ-9, GAD-7, PSS-10, WHO-5, ASRS, OCI-R)
     - 'personality': Personality & Growth (OCEAN-30, Attachment, 16 Archetypes, EQ-20, TIPI)
     - 'clinical': Clinical & Forensic (TriPM Psychopathy, LSRP Sociopathy, SD3 Dark Triad, NPI-16)
   ========================================================================== */

export const assessments = [
  // -------------------------------------------------------------
  // 1. POP-PSYCHOLOGY & SELF-DISCOVERY
  // -------------------------------------------------------------
  {
    id: "ocean30",
    category: "personality",
    name: "Big Five / OCEAN Comprehensive",
    subtitle: "OCEAN-30",
    icon: "🧭",
    minutes: 6,
    color: "from-blue-500 to-indigo-600",
    description:
      "A comprehensive 30-item assessment measuring the golden standard of modern personality psychology: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.",
    intro: "Indicate how accurately each statement describes how you generally think, feel, and behave:",
    options: LIKERT_1_5,
    type: "subscales",
    isPro: true,
    subscales: [
      { key: "Openness", items: [0, 5, 10, 15, 20, 25], color: "#6366f1", desc: "Curiosity, intellectual depth, imagination, and receptivity to art & unconventional perspectives." },
      { key: "Conscientiousness", items: [1, 6, 11, 16, 21, 26], color: "#10b981", desc: "Goal-directed impulse control, organization, reliability, and disciplined persistence." },
      { key: "Extraversion", items: [2, 7, 12, 17, 22, 27], color: "#f59e0b", desc: "Reward sensitivity, sociability, assertiveness, and enthusiasm in social environments." },
      { key: "Agreeableness", items: [3, 8, 13, 18, 23, 28], color: "#ec4899", desc: "Prosocial orientation, empathy, trustworthiness, and desire for cooperative social harmony." },
      { key: "Neuroticism", items: [4, 9, 14, 19, 24, 29], color: "#ef4444", desc: "Emotional reactivity, vulnerability to stress, anxiety sensitivity, and negative affect." },
    ],
    questions: [
      "I have a vibrant, active imagination and enjoy exploring abstract philosophies.", // O 0
      "I keep my belongings organized and follow through on commitments punctually.", // C 1
      "I feel energized when surrounded by groups of people and initiate conversations easily.", // E 2
      "I naturally empathize with other people's distress and prioritize resolving conflict.", // A 3
      "I often worry about things going wrong or feel tense even without an immediate threat.", // N 4
      "I enjoy creative artistic experiences, poetry, and unconventional perspectives.", // O 5
      "I establish clear plans and stick to them even when distractions arise.", // C 6
      "I take charge in social groups and express my opinions with confident assertiveness.", // E 7
      "I assume the best about people's intentions and find it easy to forgive.", // A 8
      "My mood shifts rapidly in response to unexpected obstacles or criticism.", // N 9
      "I love learning intricate theoretical concepts purely for the sake of understanding.", // O 10
      "I pay meticulous attention to detail and avoid careless shortcuts.", // C 11
      "I seek excitement, spontaneity, and lively social gatherings.", // E 12
      "I go out of my way to make sure other people feel supported and included.", // A 13
      "I frequently experience lingering self-doubt or rumination after social interactions.", // N 14
      "I enjoy questioning established traditions and experimenting with novel solutions.", // O 15
      "I hold myself to high standards of personal accountability and self-discipline.", // C 16
      "I express enthusiasm openly and bring lively energy to the room.", // E 17
      "I prefer cooperation and compromise over fierce competition or winning debates.", // A 18
      "I easily feel overwhelmed by sensory chaos, pressure, or demanding deadlines.", // N 19
      "I appreciate complex metaphors, aesthetic beauty, and intellectual debates.", // O 20
      "I finish tasks well ahead of deadlines rather than procrastinating.", // C 21
      "I am naturally outspoken and comfortable being the focal point of attention.", // E 22
      "I am deeply moved by the emotional struggles and vulnerabilities of others.", // A 23
      "Minor setbacks can leave me feeling irritable or despondent for hours.", // N 24
      "I seek out diverse cultures, philosophical paradoxes, and unfamiliar tastes.", // O 25
      "I keep my promises and maintain methodical order in my work environment.", // C 26
      "I recharge by connecting with vibrant social networks rather than solitary solitude.", // E 27
      "I find common ground with almost anyone, avoiding contentious arguments.", // A 28
      "I find it challenging to quiet racing worries before falling asleep.", // N 29
    ],
  },

  {
    id: "attachment",
    category: "personality",
    name: "Attachment Style Screener",
    subtitle: "ECR-16",
    icon: "🔗",
    minutes: 4,
    color: "from-teal-500 to-cyan-600",
    description:
      "Uncover your adult relational attachment blueprint across Attachment Anxiety and Attachment Avoidance, pinpointing Secure, Anxious, Dismissive, or Fearful dynamics.",
    intro: "Reflect on how you generally experience intimacy, romantic relationships, and close emotional bonds:",
    options: LIKERT_1_5,
    type: "subscales",
    isPro: false,
    subscales: [
      { key: "Attachment Anxiety", items: [0, 2, 4, 6, 8, 10, 12, 14], color: "#f43f5e", desc: "Fear of abandonment, hyper-vigilance toward partner cues, and high need for reassurance." },
      { key: "Attachment Avoidance", items: [1, 3, 5, 7, 9, 11, 13, 15], color: "#0ea5e9", desc: "Discomfort with emotional vulnerability, compulsive self-reliance, and emotional distancing." },
    ],
    questions: [
      "I worry that romantic partners will lose interest or realize they don't truly care about me.", // Anx
      "I feel uneasy when people get too close to me emotionally and prefer keeping a protective distance.", // Avoid
      "I need frequent validation and reassurance to feel confident in my partner's affection.", // Anx
      "I find it difficult to depend on others and insist on managing emotional crises entirely alone.", // Avoid
      "When a close person seems slightly distant, my mind immediately spirals into fear of rejection.", // Anx
      "Opening up about my deepest vulnerabilities feels uncomfortable and risky.", // Avoid
      "I tend to become preoccupied with my relationship to the detriment of other life priorities.", // Anx
      "When someone demands deeper intimacy, I instinctively pull away to protect my autonomy.", // Avoid
      "I over-analyze subtle shifts in text message tone, pauses, or body language.", // Anx
      "I believe true emotional independence is far safer than trusting someone completely.", // Avoid
      "I experience intense distress or anger when my partner is unavailable when I need them.", // Anx
      "I prefer resolving personal issues privately without involving romantic partners.", // Avoid
      "I often worry I care much more about my partner than they care about me.", // Anx
      "I feel suffocated when a partner wants to merge every aspect of our daily lives.", // Avoid
      "I sometimes pick arguments or test boundaries just to provoke a reaffirming response.", // Anx
      "I can easily suppress feelings of affection when relationship tension arises.", // Avoid
    ],
  },

  {
    id: "mbti16",
    category: "personality",
    name: "16 Cognitive Archetypes",
    subtitle: "Jungian / Myers-Briggs Style",
    icon: "🎭",
    minutes: 5,
    color: "from-purple-500 to-fuchsia-600",
    description:
      "Explore your psychological energy flow and cognitive processing across Introversion/Extraversion, Sensing/Intuition, Thinking/Feeling, and Judging/Perceiving.",
    intro: "Choose the statement that most authentically reflects your natural, effortless preference:",
    options: LIKERT_1_5,
    type: "archetypes",
    isPro: true,
    dimensions: [
      { code: "EI", left: "E", right: "I", leftName: "Extraversion", rightName: "Introversion", items: [0, 4, 8, 12] },
      { code: "SN", left: "S", right: "N", leftName: "Sensing (Concrete)", rightName: "Intuition (Abstract)", items: [1, 5, 9, 13] },
      { code: "TF", left: "T", right: "F", leftName: "Thinking (Logic)", rightName: "Feeling (Values)", items: [2, 6, 10, 14] },
      { code: "JP", left: "J", right: "P", leftName: "Judging (Structured)", rightName: "Perceiving (Adaptive)", items: [3, 7, 11, 15] },
    ],
    questions: [
      "I process thoughts by talking them through out loud with others (vs. private reflection).", // E high
      "I rely on verifiable facts, concrete sensory details, and tangible evidence (vs. gut hunches).", // S high
      "When making difficult decisions, objective logic and consistency override personal sentiments.", // T high
      "I feel most comfortable when schedules, agendas, and clear deadlines are established in advance.", // J high
      "After a long week, being around a stimulating group recharges my vitality (vs. solitude).", // E high
      "I focus primarily on practical real-world execution rather than theoretical futuristic possibilities.", // S high
      "I prioritize objective truth and candid fairness over protecting interpersonal harmony.", // T high
      "I dislike open-ended spontaneity; I prefer resolving decisions promptly so plans are settled.", // J high
      "I find it easy to break the ice and build rapport quickly with complete strangers.", // E high
      "I value literal observations and proven traditions over conceptual interpretations.", // S high
      "I naturally analyze systems for flaws, inefficiencies, and inconsistencies without emotional bias.", // T high
      "I experience a sense of satisfaction when checking off items from a meticulous checklist.", // J high
      "I prefer active collaborative workshops over solo research projects.", // E high
      "I focus on 'what is' right in front of me rather than reading between the lines.", // S high
      "I believe principles of justice and merit must apply universally regardless of individual feelings.", // T high
      "I feel stressed when my daily routine is disrupted by unexpected changes.", // J high
    ],
  },

  {
    id: "eq20",
    category: "personality",
    name: "Emotional Intelligence Index",
    subtitle: "EQ-20",
    icon: "💎",
    minutes: 4,
    color: "from-emerald-500 to-teal-600",
    description:
      "Assess your emotional quotient across four core pillars: Emotional Self-Awareness, Distress Regulation, Social Empathy, and Relational Navigation.",
    intro: "Rate how frequently and accurately each statement applies to your daily life:",
    options: LIKERT_1_5,
    type: "subscales",
    isPro: false,
    subscales: [
      { key: "Self-Awareness", items: [0, 4, 8, 12, 16], color: "#14b8a6", desc: "Ability to accurately label somatic emotions in real time and recognize their psychological triggers." },
      { key: "Emotional Regulation", items: [1, 5, 9, 13, 17], color: "#6366f1", desc: "Capacity to modulate intense emotional reactions, pause before impulsivity, and recover composure." },
      { key: "Empathic Resonance", items: [2, 6, 10, 14, 18], color: "#f59e0b", desc: "Skill in perceiving unspoken micro-expressions, perspectives, and emotional pain in other individuals." },
      { key: "Social Influence", items: [3, 7, 11, 15, 19], color: "#ec4899", desc: "Aptitude in resolving conflicts, communicating with compassionate tact, and inspiring collaboration." },
    ],
    questions: [
      "I can readily identify the specific emotion I am experiencing, even when it is subtle or mixed.", // SA
      "When hit with sudden rage or frustration, I can pause and breathe before taking action.", // ER
      "I can accurately detect how someone is feeling even if their verbal words say they are 'fine'.", // Emp
      "I navigate high-stakes interpersonal disagreements without triggering defensive hostility.", // SI
      "I notice how bodily tensions (jaw clenching, stomach knots) reflect my underlying emotional state.", // SA
      "I have effective mental reframing techniques that help me recover from disappointing setbacks.", // ER
      "I naturally put myself in the shoes of someone whose background and beliefs differ from mine.", // Emp
      "People frequently seek my guidance because I remain calm and constructive during group crises.", // SI
      "I understand the root psychological vulnerabilities that make me feel defensive or insecure.", // SA
      "I can tolerate ambiguity and discomfort without resorting to compulsive numbing behaviors.", // ER
      "I notice the emotional climate of a room the moment I walk through the door.", // Emp
      "I communicate boundaries clearly with empathy, preventing resentment from building.", // SI
      "I understand how my current emotional state is coloring my decision-making judgment.", // SA
      "I channel anxiety or adrenaline into productive focus rather than letting it paralyze me.", // ER
      "I listen attentively to people's pain without rushing to give unprompted unsolicited advice.", // Emp
      "I can defuse emotional tension in social settings with warm humor or validating presence.", // SI
      "I recognize my emotional blindspots and take responsibility when my moods affect others.", // SA
      "I can self-soothe effectively without needing immediate external validation.", // ER
      "I feel genuine joy when others succeed, free from quiet envy or comparison.", // Emp
      "I build deep, psychologically safe connections with others based on genuine mutual trust.", // SI
    ],
  },

  // -------------------------------------------------------------
  // 2. CLINICAL & FORENSIC PERSONALITY SCREENERS
  // -------------------------------------------------------------
  {
    id: "tripm",
    category: "clinical",
    name: "Psychopathy Triarchic Screener",
    subtitle: "TriPM Forensic Model",
    icon: "⚖️",
    minutes: 5,
    color: "from-zinc-800 to-slate-950",
    description:
      "Screen for psychopathic phenotypic dimensions via Dr. Christopher Patrick's Triarchic Model: Boldness (fearlessness/social dominance), Meanness (callousness/empathy deficits), and Disinhibition (impulsivity/lack of control).",
    intro: "For psychoeducational screening only. Rate how true each statement is of your typical behavior:",
    options: LIKERT_1_5,
    type: "subscales",
    isPro: true,
    clinicalDisclaimer: "For psychoeducational screening only; does not replace formal clinical assessment or forensic evaluation.",
    subscales: [
      { key: "Boldness", items: [0, 3, 6, 9, 12], color: "#3b82f6", desc: "Fearlessness, emotional resilience, social poise, and high tolerance for danger and high-stakes risk." },
      { key: "Meanness", items: [1, 4, 7, 10, 13], color: "#ef4444", desc: "Callous indifference, instrumental exploitation, cynical disdain, and lack of empathic attachment." },
      { key: "Disinhibition", items: [2, 5, 8, 11, 14], color: "#f97316", desc: "Deficits in impulse control, low frustration tolerance, sensation-seeking, and externalized blame." },
    ],
    questions: [
      "I rarely feel anxious, terrified, or intimidated in dangerous or high-stakes confrontations.", // Bold
      "I have little patience for people who cry; emotional weakness invites exploitation.", // Mean
      "I frequently act on immediate impulses without thinking about tomorrow's consequences.", // Disin
      "I stay calm, collected, and completely steady when others around me are panicking.", // Bold
      "I find it easy to cut people off or take advantage of their trust if it serves my ambition.", // Mean
      "I get bored very quickly and frequently break rules just to experience an adrenaline rush.", // Disin
      "I naturally dominate social conversations and can persuade almost anyone of anything.", // Bold
      "Seeing animals or strangers in distress does not provoke an emotional reaction in me.", // Mean
      "I have trouble sticking to boring obligations and frequently get in trouble for recklessness.", // Disin
      "I recover from frightening or shocking events almost instantly without lingering dread.", // Bold
      "To survive and win in this world, one must be ruthless; sentimentality is for the naive.", // Mean
      "When things go wrong in my life, it is almost always due to other people's incompetence.", // Disin
      "I actively seek out thrilling, perilous activities that most people consider terrifying.", // Bold
      "I feel zero remorse or guilt when I break a promise that is no longer advantageous to me.", // Mean
      "I lose my temper easily and lash out impulsively when someone irritates me.", // Disin
    ],
  },

  {
    id: "lsrp",
    category: "clinical",
    name: "Sociopathy & ASPD Screener",
    subtitle: "Levenson Self-Report (LSRP)",
    icon: "⚡",
    minutes: 5,
    color: "from-rose-600 to-neutral-900",
    description:
      "Evaluates Antisocial Personality traits divided into Primary Psychopathy (egocentricity, manipulation, interpersonal callousness) and Secondary Psychopathy (antisocial impulsivity, erratic lifestyle, emotional turbulence).",
    intro: "For psychoeducational screening only. Rate your degree of agreement with each statement:",
    options: LIKERT_1_5,
    type: "subscales",
    isPro: true,
    clinicalDisclaimer: "For psychoeducational screening only; does not replace formal clinical assessment.",
    subscales: [
      { key: "Primary Factor (Interpersonal/Affective)", items: [0, 2, 4, 6, 8, 10, 12, 14], color: "#dc2626", desc: "Egocentric dominance, absence of remorse, manipulative social deception, and emotional detachment." },
      { key: "Secondary Factor (Antisocial/Lifestyle)", items: [1, 3, 5, 7, 9, 11, 13, 15], color: "#ea580c", desc: "Impulsive aggression, chronic instability, resentment toward societal rules, and reactive hostility." },
    ],
    questions: [
      "Success in life is based on the survival of the fittest; I don't waste time worrying about losers.", // Primary
      "I find myself getting into intense arguments, physical altercations, or legal disputes easily.", // Secondary
      "For me, manipulating others is an intellectual chess game that I usually win.", // Primary
      "I have never been able to hold onto long-term goals; I live entirely for immediate gratification.", // Secondary
      "I tell people whatever they want to hear to get what I desire; truth is purely situational.", // Primary
      "When I am provoked, I explode into rage before I have a chance to evaluate the consequences.", // Secondary
      "I do not feel bad when someone suffers because of an action that benefited me.", // Primary
      "My life has been marked by chaotic job changes, fractured relationships, and reckless decisions.", // Secondary
      "Love and affection are transactional concepts used to bind gullible people together.", // Primary
      "I often feel bored and crave dangerous sensations, even if they put my future at risk.", // Secondary
      "Even if I hurt someone's feelings deeply, I move on quickly without feeling troubled.", // Primary
      "I resent authority figures and naturally disregard rules that feel inconvenient to me.", // Secondary
      "Looking out for number one is my primary moral compass in every situation.", // Primary
      "I have frequently borrowed money or possessions without making any serious effort to return them.", // Secondary
      "I am rarely moved by other people's tragic sob stories.", // Primary
      "I find it difficult to stay in one place or commit to long-term responsibilities.", // Secondary
    ],
  },

  {
    id: "sd3",
    category: "clinical",
    name: "Short Dark Triad Screener",
    subtitle: "SD3 Standard",
    icon: "🗡️",
    minutes: 4,
    color: "from-stone-900 to-rose-950",
    description:
      "Assesses the Dark Triad personality constellation: Machiavellianism (strategic interpersonal manipulation), Narcissism (grandiosity and entitlement), and Subclinical Psychopathy (callous disregard and thrill-seeking).",
    intro: "For psychoeducational screening only. Rate each item honestly regarding your baseline worldview:",
    options: LIKERT_1_5,
    type: "subscales",
    isPro: true,
    clinicalDisclaimer: "For psychoeducational screening only; does not replace formal clinical assessment.",
    subscales: [
      { key: "Machiavellianism", items: [0, 3, 6, 9], color: "#8b5cf6", desc: "Pragmatic deceit, strategic cynicism, manipulation, and calculating self-interest." },
      { key: "Narcissism", items: [1, 4, 7, 10], color: "#ec4899", desc: "Ego grandiosity, craving for public prestige, perceived superiority, and entitled privilege." },
      { key: "Subclinical Psychopathy", items: [2, 5, 8, 11], color: "#f43f5e", desc: "Callous indifference, impulsive thrill-seeking, low empathy, and lack of social guilt." },
    ],
    questions: [
      "It is wise to keep track of other people's secrets in case you need leverage later.", // Mach
      "I know that I am fundamentally more exceptional and talented than the average person.", // Narc
      "People often say I am cold-hearted, but I just don't get sentimental over drama.", // Psych
      "Whatever it takes to get ahead is justified; the end always justifies the means.", // Mach
      "I expect and demand special treatment because of my unique intellect or status.", // Narc
      "I enjoy doing reckless, prohibited things just to see if I can get away with it.", // Psych
      "You should never reveal your real motives to anyone unless it gives you an upper hand.", // Mach
      "I feel energized when an audience focuses their undivided attention and praise on me.", // Narc
      "I don't lose sleep over hurting someone's feelings if they were standing in my way.", // Psych
      "Most people can be manipulated if you discover which emotional buttons to press.", // Mach
      "I deserve recognition, luxury, and authority that most ordinary people cannot attain.", // Narc
      "I can turn my empathy completely off whenever a difficult or competitive situation requires it.", // Psych
    ],
  },

  {
    id: "npi16",
    category: "clinical",
    name: "Narcissistic Personality Screener",
    subtitle: "NPI-16",
    icon: "🪞",
    minutes: 3,
    color: "from-amber-600 to-yellow-500",
    description:
      "A 16-item measure assessing sub-facets of trait narcissism: Grandiose Exhibitionism, Perceived Entitlement, and Leadership/Authority orientation.",
    intro: "For psychoeducational screening only. For each pair of attitudes, select whether this trait represents you:",
    options: BINARY_0_1,
    type: "subscales",
    isPro: false,
    clinicalDisclaimer: "For psychoeducational screening only; does not replace formal clinical assessment.",
    subscales: [
      { key: "Authority & Dominance", items: [0, 3, 6, 9, 12], color: "#f59e0b", desc: "Preference for leading, directing, and having others acknowledge your authority." },
      { key: "Grandiose Exhibitionism", items: [1, 4, 7, 10, 13], color: "#ec4899", desc: "Desire for public admiration, center-stage visibility, and pride in physical/intellectual prowess." },
      { key: "Entitlement & Exploitation", items: [2, 5, 8, 11, 14, 15], color: "#ef4444", desc: "Expectation of unquestioning deference, privilege, and willingness to manipulate." },
    ],
    questions: [
      "I have a natural talent for influencing people and commanding respect when I speak.", // Auth
      "I like being the center of attention and know how to captivate an audience.", // Exhib
      "I will never be satisfied until I get all that I deserve in this world.", // Entitle
      "I see through people's pretenses and can manipulate them into doing what I want.", // Auth
      "I know that I am good because everybody keeps telling me so.", // Exhib
      "I expect a great deal from other people because of who I am.", // Entitle
      "I would prefer to be a recognized leader rather than an anonymous contributor.", // Auth
      "I really like to be the center of attention wherever I go.", // Exhib
      "I find it easy to sway others to agree with my viewpoints.", // Entitle
      "I am an extraordinary person whose full potential has rarely been equaled.", // Auth
      "I enjoy showing off my body or accomplishments to evoke admiration.", // Exhib
      "I insist on getting the respect that is due to someone of my caliber.", // Entitle
      "People always seem to recognize my authority in critical decision moments.", // Auth
      "I am apt to show off if I get the chance.", // Exhib
      "I expect others to cater to my needs before their own trivial concerns.", // Entitle
      "I am destined for greatness and exceptional accomplishments.", // Entitle
    ],
  },

  // -------------------------------------------------------------
  // 3. CLINICAL WELLNESS CHECK-INS (EXISTING & EXPANDED)
  // -------------------------------------------------------------
  {
    id: "phq9",
    category: "wellness",
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
    category: "wellness",
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
    category: "wellness",
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
    category: "wellness",
    name: "Wellbeing Index",
    subtitle: "WHO-5",
    icon: "🌿",
    minutes: 1,
    color: "from-emerald-500 to-lime-500",
    description:
      "The World Health Organization's 5-item wellbeing index — one of the most widely used measures of subjective wellbeing.",
    intro: "Over the last two weeks…",
    options: WHO_0_5,
    scale: (raw) => raw * 4,
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
    category: "personality",
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

  {
    id: "asrs",
    category: "wellness",
    name: "Adult ADHD Screener",
    subtitle: "ASRS v1.1 Screener",
    icon: "⚡",
    minutes: 3,
    color: "from-amber-500 to-yellow-600",
    description:
      "The World Health Organization Adult ADHD Self-Report Scale (ASRS v1.1) Part A screener, assessing executive dysfunction, organization, and hyperactivity.",
    intro: "Over the past 6 months, how frequently have you experienced each problem?",
    options: FREQ_0_3,
    questions: [
      "Trouble wrapping up final details of a project once the challenging parts have been done",
      "Difficulty getting things in order when you have to do a task that requires organization",
      "Problems remembering appointments or obligations",
      "When you have a task requiring a lot of thought, you avoid or delay getting started",
      "Fidget or squirm with your hands or feet when you have to sit down for a long time",
      "Feel overly active and compelled to do things, like you were driven by a motor",
    ],
    bands: [
      { max: 5, level: "Low likelihood", tone: "good", advice: "Your responses do not indicate clinically significant ADHD executive functioning challenges at this time." },
      { max: 11, level: "Moderate indication", tone: "warn", advice: "Some symptoms consistent with adult inattention or impulsivity. Structural hacks (visual cues, pomodoro timers, externalizing memory) can help." },
      { max: 18, level: "High likelihood", tone: "alert", advice: "Significant symptoms consistent with Adult ADHD. Consider sharing these results with a clinical psychologist or psychiatrist for a formal diagnostic evaluation." },
    ],
  },

  {
    id: "ocir",
    category: "wellness",
    name: "Obsessive-Compulsive Screener",
    subtitle: "OCI-R Standard",
    icon: "🔄",
    minutes: 3,
    color: "from-violet-500 to-indigo-600",
    description:
      "The Obsessive-Compulsive Inventory-Revised (OCI-R) screener measures symptom distress across checking, washing, ordering, obsessing, and neutralizing.",
    intro: "In the past month, how much have the following thoughts or behaviors distressed you?",
    options: LIKERT_0_4,
    questions: [
      "I check things more often than necessary (doors, locks, appliances).",
      "I get upset if objects are not arranged in a specific order.",
      "I feel compelled to wash my hands repeatedly or avoid touching things due to contamination fears.",
      "I am upset by unpleasant thoughts that enter my mind against my will.",
      "I feel I have to repeat certain numbers or mental rituals to ward off bad luck.",
      "I find it difficult to control intrusive doubts even when I logically know everything is fine.",
    ],
    bands: [
      { max: 6, level: "Subclinical", tone: "good", advice: "Your scores reflect minimal distress from obsessive or compulsive behaviors." },
      { max: 14, level: "Mild to Moderate", tone: "warn", advice: "You experience noticeable distress from compulsive checking, ordering, or intrusive thoughts. Mindfulness and exposure-response prevention (ERP) principles can offer relief." },
      { max: 24, level: "Elevated Indication", tone: "alert", advice: "Scores indicate significant distress consistent with OCD symptoms. We strongly recommend consulting a licensed clinician specialized in CBT and ERP." },
    ],
  },
];

/* ==========================================================================
   SCORING ALGORITHMS
   ========================================================================== */

export function scoreAssessment(assessment, answers) {
  if (assessment.type === "personality") return scoreTipi(answers);
  if (assessment.type === "subscales") return scoreSubscales(assessment, answers);
  if (assessment.type === "archetypes") return scoreArchetypes(assessment, answers);

  // Standard unidimensional scoring
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

  const maxVal = Math.max(...assessment.options.map((o) => o.value));
  const maxScore = assessment.scale
    ? assessment.scale(maxVal * assessment.questions.length)
    : maxVal * assessment.questions.length;

  const riskFlag =
    assessment.riskItemIndex !== undefined && answers[assessment.riskItemIndex] > 0;

  return {
    score: total,
    maxScore,
    band,
    riskFlag,
    percent: Math.round((total / (maxScore || 1)) * 100),
  };
}

export function scoreSubscales(assessment, answers) {
  const facets = assessment.subscales.map((sub) => {
    let raw = 0;
    let count = 0;
    sub.items.forEach((itemIdx) => {
      if (answers[itemIdx] !== undefined) {
        raw += answers[itemIdx];
        count++;
      }
    });

    const minOption = Math.min(...assessment.options.map((o) => o.value));
    const maxOption = Math.max(...assessment.options.map((o) => o.value));
    const minPossible = minOption * count;
    const maxPossible = maxOption * count;
    const percent = maxPossible > minPossible
      ? Math.round(((raw - minPossible) / (maxPossible - minPossible)) * 100)
      : 50;

    let tier = "Moderate";
    if (percent < 35) tier = "Low";
    else if (percent > 68) tier = "Elevated / High";

    return {
      name: sub.key,
      score: raw,
      maxScore: maxPossible,
      percent,
      tier,
      color: sub.color,
      desc: sub.desc,
    };
  });

  const overallPercent = Math.round(
    facets.reduce((acc, f) => acc + f.percent, 0) / (facets.length || 1)
  );

  return {
    type: "subscales",
    facets,
    overallPercent,
    isPro: assessment.isPro,
    clinicalDisclaimer: assessment.clinicalDisclaimer,
    summary: `Profile synthesized across ${facets.length} psychometric sub-dimensions.`,
  };
}

export function scoreArchetypes(assessment, answers) {
  // Myers-Briggs style four-letter archetype calculator
  let archetypeCode = "";
  const dimensions = assessment.dimensions.map((dim) => {
    let sum = 0;
    dim.items.forEach((idx) => {
      sum += answers[idx] ?? 3;
    });
    const avg = sum / dim.items.length; // 1 to 5 scale
    const rightPercent = Math.round(((avg - 1) / 4) * 100);
    const letter = avg > 3.0 ? dim.right : dim.left;
    archetypeCode += letter;

    return {
      name: `${dim.leftName} vs. ${dim.rightName}`,
      chosen: letter === dim.right ? dim.rightName : dim.leftName,
      letter,
      percent: letter === dim.right ? rightPercent : 100 - rightPercent,
    };
  });

  const ARCHETYPE_DESCS = {
    INTJ: { title: "The Architect / Mastermind", blurb: "Strategic, analytical, and highly independent. You envision comprehensive systems and hold exceptionally high internal standards." },
    INTP: { title: "The Logician / Theorist", blurb: "Innovative, curious, and intellectually incisive. You constantly deconstruct ideas to discover underlying first principles." },
    ENTJ: { title: "The Commander / Executive", blurb: "Decisive, authoritative, and boldly ambitious. You excel at mobilizing resources and orchestrating complex strategies." },
    ENTP: { title: "The Visionary / Debater", blurb: "Quick-witted, unconventional, and intellectually agile. You thrive on challenging orthodox dogmas and exploring novel possibilities." },
    INFJ: { title: "The Counselor / Advocate", blurb: "Deeply empathic, principled, and insightful. You quietly strive to nurture human potential and meaningful ideals." },
    INFP: { title: "The Mediator / Idealist", blurb: "Poetic, authentic, and compassionate. You are guided by unwavering personal core values and deep imaginative depths." },
    ENFJ: { title: "The Protagonist / Mentor", blurb: "Charismatic, inspiring, and emotionally resonant. You effortlessly connect people and rally communities toward growth." },
    ENFP: { title: "The Campaigner / Catalyst", blurb: "Enthusiastic, creative, and spontaneous. You see radiant possibilities everywhere and inspire others with warmth." },
    ISTJ: { title: "The Inspector / Custodian", blurb: "Methodical, dutiful, and dependable. You preserve stability, honor commitments, and execute procedures with precision." },
    ISFJ: { title: "The Protector / Defender", blurb: "Devoted, warm, and conscientious. You offer steady practical support and create harmonious environments." },
    ESTJ: { title: "The Director / Organizer", blurb: "Structured, pragmatic, and dedicated to order. You bring efficiency and clear accountability to teams." },
    ESFJ: { title: "The Provider / Caregiver", blurb: "Supportive, sociable, and attentive. You foster cooperative community bonds and anticipate others' practical needs." },
    ISTP: { title: "The Craftsman / Virtuoso", blurb: "Calm, observant, and technically versatile. You master tools and troubleshoot mechanical or logical challenges with detachment." },
    ISFP: { title: "The Adventurer / Artist", blurb: "Gentle, aesthetically sensitive, and spontaneous. You express your individuality through hands-on creative experiences." },
    ESTP: { title: "The Dynamo / Entrepreneur", blurb: "Energetic, perceptive, and action-oriented. You adapt rapidly to immediate crises and thrive on high-stimulus challenges." },
    ESFP: { title: "The Performer / Entertainer", blurb: "Vibrant, playful, and generous. You love bringing joy, sensory delight, and present-moment excitement to others." },
  };

  const details = ARCHETYPE_DESCS[archetypeCode] || {
    title: `Cognitive Archetype ${archetypeCode}`,
    blurb: "A unique balance of analytical clarity, sensory engagement, and intuitive adaptation.",
  };

  return {
    type: "archetypes",
    archetypeCode,
    title: details.title,
    blurb: details.blurb,
    dimensions,
    isPro: assessment.isPro,
  };
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
