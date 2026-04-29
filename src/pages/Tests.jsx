import React, { useState } from 'react';

export default function Tests() {
  const [score, setScore] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  if (!testStarted) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-md mt-20 transition-colors duration-500">
        <div className="text-5xl mb-6">🧠</div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">Personality Insights</h1>
        <p className="mb-8 text-zinc-500 dark:text-zinc-400 font-medium">Discover behavioral patterns and understand yourself a little better.</p>
        <button 
          onClick={() => setTestStarted(true)}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
        >
          Start First Test
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-md mt-20 transition-colors duration-500">
      <span className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4 block">Question 1 of 5</span>
      <h2 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white">Do you feel energized after meeting new people, or drained?</h2>
      
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => alert("Answer recorded!")}
          className="w-full text-left px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-800 dark:text-zinc-200 font-medium transition-all"
        >
          A. Energized and ready for more.
        </button>
        <button 
          onClick={() => alert("Answer recorded!")}
          className="w-full text-left px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-800 dark:text-zinc-200 font-medium transition-all"
        >
          B. Drained, I need time alone to recharge.
        </button>
      </div>
    </div>
  );
}