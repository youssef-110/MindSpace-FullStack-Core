import { Icon } from "../ui";

// The lesson's own figure when it has one, otherwise about 200 words a minute from its text.
const minutesFor = (lesson) => lesson.minutes ?? Math.max(1, Math.round(lesson.sections.flat().join(" ").split(/\s+/).length / 200));

export default function ReadTime({ lesson, className = "" }) {
  return (
    <span className={`tag num ${className}`}>
      <Icon name="clock" size={14} />
      {minutesFor(lesson)} min read
    </span>
  );
}
