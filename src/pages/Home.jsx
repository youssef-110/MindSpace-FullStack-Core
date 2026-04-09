import React from 'react';

const FeatureCard = ({ title, description, icon }) => (
  <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-500">
    <div className="text-4xl mb-6">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">{title}</h3>
    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">{description}</p>
  </div>
);

export default function Home() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <section className="text-center py-24">
        {/* FIXED: text-zinc-900 for Light Mode, dark:text-white for Dark Mode */}
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 transition-colors duration-500">
          MindSpace
        </h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
          A digital sanctuary for clarity, mood tracking, and self-reflection.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <FeatureCard icon="🧠" title="Focus" description="Minimize distractions and find your flow." />
        <FeatureCard icon="☁️" title="Cloud Sync" description="Your data, everywhere you go." />
        <FeatureCard icon="🔒" title="Secure" description="Private and encrypted reflections." />
      </div>
    </div>
  );
}