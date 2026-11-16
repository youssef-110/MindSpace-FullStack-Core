// Primary Care PTSD Screen for DSM-5. Wording, entry question and cut-point checked against the
// National Center for PTSD form (version date 2022):
// https://www.ptsd.va.gov/professional/assessment/documents/pc-ptsd5-screen.pdf
export const pcPtsd5 = {
  id: "pc-ptsd-5",
  category: "wellbeing",
  name: "Trauma reactions screen",
  instrument: "PC-PTSD-5, 5 items after one entry question",
  minutes: 2,
  lesson: "trauma",
  sensitive: true,
  measures: "Whether, in the past month, you have had the reactions that most often follow a frightening or horrible event: unwanted memories, avoidance, being on guard, numbness, and guilt or blame.",
  cannot: "It is a short screen, not a diagnosis, and it does not ask what happened. Strong reactions in the first weeks after an event are common and often ease. The cut-point of 4 missed many women in the validation study, so a lower score does not rule anything out.",
  source: "Prins, A. et al. (2015). Primary Care PTSD Screen for DSM-5 (PC-PTSD-5). National Center for PTSD, US Department of Veterans Affairs (ptsd.va.gov). Developed by VA staff; in the public domain and not copyrighted. The VA reports that a cut-point of 4 best balanced false negatives and false positives in a large sample of VA primary care patients.",
  intro: "The first question asks whether something like this has ever happened to you. You will not be asked to describe it. If your answer is No, the screen does not apply: answer No to the rest and your score is 0.",
  options: [{ label: "No", value: 0 }, { label: "Yes", value: 1 }],
  items: [
    "Sometimes things happen to people that are unusually or especially frightening, horrible, or traumatic. For example: a serious accident or fire; a physical or sexual assault or abuse; an earthquake or flood; a war; seeing someone be killed or seriously injured; having a loved one die through homicide or suicide. Have you ever experienced this kind of event?",
    "In the past month, have you had nightmares about the event(s) or thought about the event(s) when you did not want to?",
    "In the past month, have you tried hard not to think about the event(s) or went out of your way to avoid situations that reminded you of the event(s)?",
    "In the past month, have you been constantly on guard, watchful, or easily startled?",
    "In the past month, have you felt numb or detached from people, activities, or your surroundings?",
    "In the past month, have you felt guilty or unable to stop blaming yourself or others for the event(s) or any problems the event(s) may have caused?",
  ],
  scoring: {
    type: "sum",
    gate: 0, // the entry question is not scored; "No" there makes the total 0
    max: 5,
    bands: [
      { max: 3, level: "Below the screening cut-point", tone: "ok", text: "Your answers are below the cut-point of 4 used in the validation research. Screens like this miss some people, so if these reactions are getting in the way of your life, that matters more than the number." },
      { max: 5, level: "At or above the screening cut-point", tone: "warn", text: "Your answers are at or above the cut-point of 4 used in the validation research. This is not a diagnosis. It suggests that talking with a doctor or a trauma-informed therapist could be worthwhile. Effective treatments exist, and you decide the pace." },
    ],
  },
};
