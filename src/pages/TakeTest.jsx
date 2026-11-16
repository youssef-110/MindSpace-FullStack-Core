import { Suspense, useCallback, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { byId, scoreQuestionnaire } from "../lib/tests/questionnaires";
import { scoreMatrix, TIME_LIMIT_SEC } from "../lib/tests/matrix";
import { assessQuality } from "../lib/tests/quality";
import { load, save, saveResult } from "../lib/storage";
import { TASK_COMPONENTS } from "../components/tasks";
import { EASE } from "../components/ui";
import Intro from "../components/test/Intro";
import QuestionFlow from "../components/test/QuestionFlow";
import MatrixFlow from "../components/test/MatrixFlow";

const draftKey = (id) => `draft:${id}`;

export default function TakeTest() {
  const { id } = useParams();
  const test = byId(id);
  const navigate = useNavigate();
  const [running, setRunning] = useState(null); // null | { initial }
  const [openedAt] = useState(() => Date.now());
  const saved = useRef(false);

  const finishQuestionnaire = useCallback(
    (answers, timesMs) => {
      // One identical answer all the way down only contradicts itself when some items are reverse-worded.
      const reverseKeyed = Boolean(test.scoring.reverse?.length) || ["traits", "subscales"].includes(test.scoring.type);
      const quality = assessQuality({ answers, timesMs, reverseKeyed });
      const entry = saveResult(test.id, { ...scoreQuestionnaire(test, answers), quality });
      save(draftKey(test.id), null);
      navigate(`/results/${entry.id}`, { replace: true });
    },
    [test, navigate]
  );
  const finishMatrix = useCallback(
    (state, form) => {
      const entry = saveResult("matrix", { ...scoreMatrix(form, state.answers), seed: state.seed, seconds: Math.round((Date.now() - state.startedAt) / 1000) });
      save(draftKey("matrix"), null);
      navigate(`/results/${entry.id}`, { replace: true });
    },
    [navigate]
  );
  const finishTask = useCallback(
    (result) => {
      if (saved.current) return; // a task must not save twice
      saved.current = true;
      const entry = saveResult(test.id, result);
      save(draftKey(test.id), null);
      navigate(`/results/${entry.id}`, { replace: true });
    },
    [test, navigate]
  );

  if (!test) return <p className="py-20">Test not found. <Link to="/tests" className="link">See all tests</Link></p>;
  const type = test.scoring.type;
  const Task = type === "task" ? TASK_COMPONENTS[test.id] : null;
  const stored = load(draftKey(test.id), null);
  // A matrix draft past its time limit is dropped rather than resumed.
  const expired = stored && type === "matrix" && openedAt - stored.startedAt > TIME_LIMIT_SEC * 1000;
  // So is a questionnaire draft that no longer matches the items.
  const stale = stored && type !== "matrix" && stored.answers?.length !== test.items?.length;
  const draft = expired || stale || type === "task" ? null : stored;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!running ? (
        <motion.div key="intro" exit={{ opacity: 0, y: -14, scale: 0.985 }} transition={{ duration: 0.22, ease: "easeIn" }}>
          <Intro
            test={test}
            draft={draft}
            unavailable={type === "task" && !Task}
            onStart={(d) => {
              if (!d) save(draftKey(test.id), null);
              setRunning({ initial: d });
              window.scrollTo({ top: 0, behavior: "instant" }); // the intro is taller than the first screen of a test
            }}
          />
        </motion.div>
      ) : (
        <motion.div key="run" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}>
          {type === "matrix" ? (
            <MatrixFlow initial={running.initial} onDone={finishMatrix} />
          ) : type === "task" ? (
            <Suspense fallback={<div className="skeleton mx-auto h-80 max-w-2xl" aria-busy="true" aria-label="Loading the task" />}>
              <Task test={test} onComplete={finishTask} />
            </Suspense>
          ) : (
            <QuestionFlow test={test} initial={running.initial} onDone={finishQuestionnaire} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
