// Interactive cognitive tasks (reaction time, memory span, ...). Same metadata shape as a
// questionnaire, with scoring: { type: "task" }. Rendered by src/components/tasks and scored
// by the pure functions in ./cognitive.js.

// Every timed task carries this: a browser cannot see its own input and display delay.
const DEVICE =
  "Browsers, screens, touch digitisers and Bluetooth keyboards add tens of milliseconds of delay that this page cannot measure, and the amount differs between devices. Compare yourself with yourself on the same device, not with other people. Tiredness, caffeine and practice all move the score.";

export const tasks = [
  {
    id: "reaction-time",
    category: "cognitive",
    name: "Reaction time",
    cta: "Test your reaction time",
    instrument: "Simple visual reaction, 8 timed rounds",
    minutes: 2,
    measures: "How quickly you can respond to something appearing on screen: the time from a disc filling in to your tap or key press, taken as the median of eight rounds.",
    cannot: `It is not a measure of intelligence, driving ability or health. ${DEVICE}`,
    source:
      "Simple reaction time task in the style of Woods et al. (2015), Frontiers in Human Neuroscience 9:131, who measured a mean of 231 ms in 1,469 adults on lab hardware. The Human Benchmark web test reports a median of 273 ms across its users. The bands here are descriptions set around those figures, not percentiles.",
    intro: "Two practice rounds, then eight that count. Wait for the disc to fill, then tap.",
    scoring: { type: "task" },
  },
  {
    id: "digit-span",
    category: "cognitive",
    name: "Digit span",
    cta: "Test your digit span",
    instrument: "Forward digit span, visual",
    minutes: 4,
    lesson: "memory",
    measures: "Short-term memory for order: the longest string of digits you can watch once and type back correctly.",
    cannot: `It is not an IQ score or a test for memory problems, and one sitting is a rough estimate that strategy changes a lot (grouping digits helps). ${DEVICE}`,
    source:
      "Forward digit span with two attempts per length, as in the Wechsler scales. Miller (1956), Psychological Review 63, described the usual limit as about seven items, plus or minus two. Woods et al. (2011), Journal of Clinical and Experimental Neuropsychology 33, found spoken spans averaging between 6 and 7 digits in 763 adults. Digits here are seen and typed, so the bands are descriptions, not percentiles.",
    intro: "Digits appear one at a time. When they stop, type them back in the same order.",
    scoring: { type: "task" },
  },
  {
    id: "stroop",
    category: "cognitive",
    name: "Stroop test",
    cta: "Try the Stroop test",
    instrument: "Colour-word Stroop, 40 timed words",
    minutes: 3,
    lesson: "biases",
    measures: "How much an automatic habit (reading) gets in the way of a deliberate task (naming ink colour): the extra time you need when the word and its ink disagree.",
    cannot: `It depends on colour vision, so it will not work properly if you have difficulty telling red, green, blue and yellow apart. It is not a test of attention problems or brain health, and one person's score shifts noticeably from one sitting to the next. ${DEVICE}`,
    source:
      "Stroop (1935), Journal of Experimental Psychology 18; reviewed by MacLeod (1991), Psychological Bulletin 109. Hedge, Powell and Sumner (2018), Behavior Research Methods 50, found the effect very reliable across a group but only moderately stable for one person (retest correlations near 0.6). No norms exist for this four-button browser version, so the bands are descriptions.",
    intro: "Press the colour of the ink, not the word. Six practice words, then forty that count.",
    scoring: { type: "task" },
  },
];
