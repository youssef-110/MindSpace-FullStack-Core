// IPIP Need for Cognition scale. Items and keying checked against the IPIP scoring key:
// https://ipip.ori.org/newSingleConstructsKey.htm (the IPIP is in the public domain).
const ACCURATE_1_5 = ["Very inaccurate", "Moderately inaccurate", "Neither accurate nor inaccurate", "Moderately accurate", "Very accurate"];

// [text, keying]. Order alternates plus and minus keyed items, as the IPIP suggests.
const ITEMS = [
  ["Like to solve complex problems.", 1],
  ["Have difficulty understanding abstract ideas.", -1],
  ["Need things explained only once.", 1],
  ["Try to avoid complex people.", -1],
  ["Can handle a lot of information.", 1],
  ["Avoid difficult reading material.", -1],
  ["Love to think up new ways of doing things.", 1],
  ["Avoid philosophical discussions.", -1],
  ["Am quick to understand things.", 1],
  ["Love to read challenging material.", 1],
];

export const needForCognition = {
  id: "need-for-cognition",
  category: "personality",
  name: "Enjoyment of thinking",
  instrument: "IPIP Need for Cognition scale, 10 items",
  minutes: 2,
  lesson: "biases",
  measures: "How much you enjoy effortful thinking: working through complex problems, hard reading and abstract ideas.",
  cannot: "It measures liking for thinking, not thinking ability, and it does not make anyone immune to biases. The IPIP publishes no norms, so the low, middle and high labels are thirds of the score range, not percentiles.",
  source: "International Personality Item Pool (ipip.ori.org), public domain. The scale was built to measure the same construct as Cacioppo, J. T., & Petty, R. E. (1982), Journal of Personality and Social Psychology, 42, 116-131. Reported reliability (α) = .84.",
  intro: "Describe yourself as you generally are now, not as you wish to be. How accurately does each statement describe you?",
  options: ACCURATE_1_5.map((label, i) => ({ label, value: i + 1 })),
  items: ITEMS.map(([text]) => text),
  scoring: {
    type: "sum",
    reverse: ITEMS.flatMap(([, sign], i) => (sign < 0 ? [i] : [])),
    min: 10,
    max: 50,
    bands: [
      { max: 23, level: "Lower third of the range", tone: "ok", text: "You tend to prefer the practical and direct over long chains of reasoning. That is a preference, not a limit. For decisions that matter, a simple checklist does the slow thinking for you." },
      { max: 36, level: "Middle third of the range", tone: "ok", text: "You enjoy thinking things through when the subject interests you and take shortcuts when it does not, like most people." },
      { max: 50, level: "Upper third of the range", tone: "good", text: "You like complex problems and demanding ideas. People who enjoy thinking still have biases, so asking what would change your mind stays useful." },
    ],
  },
};
