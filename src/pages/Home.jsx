import React from 'react';

// Sub-components keep the main Home component clean and readable
const FeatureCard = ({ title, description, icon }) => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="px-8 py-20 bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Welcome to MindSpace
          </h1>
          <p className="text-xl text-indigo-100 mb-8">
            Your digital sanctuary for focus, clarity, and organized thought.
          </p>
          <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors">
            Get Started
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="🧠"
            title="Focus Deeply" 
            description="Tools designed to minimize distraction and maximize cognitive flow." 
          />
          <FeatureCard 
            icon="☁️"
            title="Sync Anywhere" 
            description="Your thoughts, perfectly synced across all your devices in real-time." 
          />
          <FeatureCard 
            icon="🔒"
            title="Private & Secure" 
            description="End-to-end encryption ensures your mind space stays yours alone." 
          />
        </div>
      </section>
    </main>
  );
}