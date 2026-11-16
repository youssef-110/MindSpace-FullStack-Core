// Experiences in Close Relationships-Revised. Items, keying, instructions and the 1-7 scale checked against
// the author's page: https://labs.psychology.illinois.edu/~rcfraley/measures/ecrritems.htm
// [text, reverse-keyed]. Listed in the author's order: ANXIETY is items 1-18, AVOIDANCE is items 19-36.
const ANXIETY = [
  ["I'm afraid that I will lose my partner's love.", 0],
  ["I often worry that my partner will not want to stay with me.", 0],
  ["I often worry that my partner doesn't really love me.", 0],
  ["I worry that romantic partners won't care about me as much as I care about them.", 0],
  ["I often wish that my partner's feelings for me were as strong as my feelings for him or her.", 0],
  ["I worry a lot about my relationships.", 0],
  ["When my partner is out of sight, I worry that he or she might become interested in someone else.", 0],
  ["When I show my feelings for romantic partners, I'm afraid they will not feel the same about me.", 0],
  ["I rarely worry about my partner leaving me.", 1],
  ["My romantic partner makes me doubt myself.", 0],
  ["I do not often worry about being abandoned.", 1],
  ["I find that my partner(s) don't want to get as close as I would like.", 0],
  ["Sometimes romantic partners change their feelings about me for no apparent reason.", 0],
  ["My desire to be very close sometimes scares people away.", 0],
  ["I'm afraid that once a romantic partner gets to know me, he or she won't like who I really am.", 0],
  ["It makes me mad that I don't get the affection and support I need from my partner.", 0],
  ["I worry that I won't measure up to other people.", 0],
  ["My partner only seems to notice me when I'm angry.", 0],
];
const AVOIDANCE = [
  ["I prefer not to show a partner how I feel deep down.", 0],
  ["I feel comfortable sharing my private thoughts and feelings with my partner.", 1],
  ["I find it difficult to allow myself to depend on romantic partners.", 0],
  ["I am very comfortable being close to romantic partners.", 1],
  ["I don't feel comfortable opening up to romantic partners.", 0],
  ["I prefer not to be too close to romantic partners.", 0],
  ["I get uncomfortable when a romantic partner wants to be very close.", 0],
  ["I find it relatively easy to get close to my partner.", 1],
  ["It's not difficult for me to get close to my partner.", 1],
  ["I usually discuss my problems and concerns with my partner.", 1],
  ["It helps to turn to my romantic partner in times of need.", 1],
  ["I tell my partner just about everything.", 1],
  ["I talk things over with my partner.", 1],
  ["I am nervous when partners get too close to me.", 0],
  ["I feel comfortable depending on romantic partners.", 1],
  ["I find it easy to depend on romantic partners.", 1],
  ["It's easy for me to be affectionate with my partner.", 1],
  ["My partner really understands me and my needs.", 1],
];

// The author asks for the two scales to be mixed, so they alternate: even positions anxiety, odd avoidance.
const MIXED = ANXIETY.flatMap((a, i) => [a, AVOIDANCE[i]]);
const positions = (parity, onlyReversed) => MIXED.flatMap(([, rev], i) => (i % 2 === parity && (!onlyReversed || rev) ? [i] : []));

// No published cut-offs. Bands follow the response scale: below 3 is mostly disagreeing, above 5 mostly agreeing.
const bands = (low, mid, high) => [
  { max: 2.99, band: "low", level: "Low", tone: "good", note: low },
  { max: 5, band: "mid", level: "Moderate", tone: "ok", note: mid },
  { max: 7, band: "high", level: "High", tone: "warn", note: high },
];

export const ecrR = {
  id: "ecr-r",
  category: "relationships",
  name: "Attachment in close relationships",
  instrument: "Experiences in Close Relationships-Revised (ECR-R), 36 items",
  minutes: 7,
  lesson: "attachment",
  measures: "Two dimensions of adult attachment in romantic relationships: anxiety (worry about being rejected or left) and avoidance (discomfort with closeness and depending on a partner).",
  cannot: "It describes how you say you generally feel in romantic relationships, not a fixed type, and it says nothing about a particular partner. There are no cut-offs: the low, moderate and high labels describe where your average answer sits on the 1 to 7 scale, not how you compare with other people.",
  source: "Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000). Journal of Personality and Social Psychology, 78, 350-365. The author states the scales were published for use in the public domain and need no permission for non-commercial use (labs.psychology.illinois.edu/~rcfraley/measures/ecrr.htm).",
  intro: "The statements below concern how you feel in emotionally intimate relationships. We are interested in how you generally experience relationships, not just in what is happening in a current relationship. Rate each statement from 1 (strongly disagree) to 7 (strongly agree).",
  options: ["1 (strongly disagree)", "2", "3", "4", "5", "6", "7 (strongly agree)"].map((label, i) => ({ label, value: i + 1 })),
  items: MIXED.map(([text]) => text),
  scoring: {
    type: "subscales",
    method: "mean",
    scales: [
      {
        key: "anxiety", name: "Attachment anxiety", items: positions(0), reverse: positions(0, true), min: 1, max: 7,
        bands: bands(
          "You rarely worry about being rejected or left by a partner.",
          "You sometimes worry about where you stand with a partner, as many people do.",
          "You often worry about losing a partner's love or not being cared for as much as you care. Saying what you need directly tends to work better than waiting for reassurance.",
        ),
      },
      {
        key: "avoidance", name: "Attachment avoidance", items: positions(1), reverse: positions(1, true), min: 1, max: 7,
        bands: bands(
          "You are comfortable being close to a partner and relying on them.",
          "You are comfortable with closeness in some ways and keep some distance in others.",
          "You tend to keep feelings to yourself and find it hard to depend on a partner. Small steps, such as sharing one concern, are a low-risk way to test closeness.",
        ),
      },
    ],
  },
};
