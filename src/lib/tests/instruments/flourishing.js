// Flourishing Scale. Items, 1-7 response scale and 8-56 scoring checked against the authors' sheet:
// https://eddiener.com/wp-content/uploads/2024/09/Flourishing-Scale.pdf
const AGREE_1_7 = ["Strongly disagree", "Disagree", "Slightly disagree", "Neither agree nor disagree", "Slightly agree", "Agree", "Strongly agree"];

export const flourishing = {
  id: "flourishing",
  category: "wellbeing",
  name: "Flourishing",
  instrument: "Flourishing Scale (FS), 8 items",
  minutes: 2,
  lesson: "wellbeing",
  measures: "How well you feel your life is going in areas that matter for psychological wellbeing: purpose, relationships, engagement, competence, optimism and self-respect.",
  cannot: "The authors publish no cut-offs, so the labels below only describe where your answers sit on the agreement scale. They are not a comparison with other people, and one total can't show which area is strong or weak.",
  source: "Diener, E., Wirtz, D., Tov, W., Kim-Prieto, C., Choi, D., Oishi, S., & Biswas-Diener, R. (2009). New measures of well-being: Flourishing and positive and negative feelings. Social Indicators Research, 39, 247-266 (citation as given by the authors). Copyright Ed Diener and Robert Biswas-Diener (2009); free to use with credit for non-commercial purposes (eddiener.com/flourishing-scale-fs).",
  intro: "Below are 8 statements with which you may agree or disagree. How much do you agree with each one?",
  options: AGREE_1_7.map((label, i) => ({ label, value: i + 1 })),
  items: [
    "I lead a purposeful and meaningful life",
    "My social relationships are supportive and rewarding",
    "I am engaged and interested in my daily activities",
    "I actively contribute to the happiness and well-being of others",
    "I am competent and capable in the activities that are important to me",
    "I am a good person and live a good life",
    "I am optimistic about my future",
    "People respect me",
  ],
  scoring: {
    type: "sum",
    min: 8,
    max: 56,
    // No published bands. These follow the response scale: 32 is "neither agree nor disagree" on average, 48 is "agree".
    bands: [
      { max: 31, level: "Mostly disagreeing", tone: "warn", text: "On average you disagreed with these statements. Several areas of life may feel thin right now. Picking one, such as a relationship or an activity you used to enjoy, is a realistic place to start." },
      { max: 47, level: "Mixed to agreeing", tone: "ok", text: "On average you were between neutral and agreeing. Some areas feel solid and others less so. Looking at which statements you rated lowest tells you more than the total." },
      { max: 56, level: "Agreeing throughout", tone: "good", text: "On average you agreed or strongly agreed. You see yourself as having purpose, good relationships and confidence in what you do." },
    ],
  },
};
