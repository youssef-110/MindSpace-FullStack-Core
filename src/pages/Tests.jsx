import React, { useState } from 'react';

export default function Tests() {
  const [score, setScore] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  if (!testStarted) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Personality Quiz</h1>
        <p className="mb-6">Click the button below to start your first test.</p>
        <button 
          onClick={() => setTestStarted(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          Start Test
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-md mx-auto bg-white shadow-2xl rounded-2xl mt-10 border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Question 1: Do you enjoy meeting new people?</h2>
      <div className="flex gap-4">
        <button 
          onClick={() => alert("You clicked Yes!")}
          className="bg-green-500 text-white px-6 py-2 rounded-md font-medium"
        >
          Yes
        </button>
        <button 
          onClick={() => alert("You clicked No!")}
          className="bg-red-500 text-white px-6 py-2 rounded-md font-medium"
        >
          No
        </button>
      </div>
    </div>
  );
}