import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, getDocs, query, deleteDoc, doc } from "firebase/firestore";

const Tracker = () => {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, "moods")); 
        const querySnapshot = await getDocs(q);
        const loadedLogs = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
        setHistory(loadedLogs.sort((a, b) => b.id - a.id));
      } catch (e) { console.error("Firebase error", e); }
    };
    fetchLogs();
  }, []);

  // Use semantic names so we can map them to reactive Tailwind classes
  const moodConfig = {
    '🌟': { label: 'Radiant', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800' },
    '😊': { label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800' },
    '😐': { label: 'Still', color: 'bg-zinc-400', text: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100/50 dark:bg-zinc-800/50', border: 'border-zinc-200 dark:border-zinc-700' },
    '😔': { label: 'Heavy', color: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50/50 dark:bg-sky-900/20', border: 'border-sky-100 dark:border-sky-800' },
    '🌧️': { label: 'Overwhelmed', color: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800' },
  };

  const getCalendarDays = () => {
    const days = [];
    for (let i = 20; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      const hasLog = history.some(entry => entry.date === dateStr);
      days.push({ dayNum: d.getDate(), dateStr, hasLog });
    }
    return days;
  };

  const handleLog = async () => {
    if (!mood) return;
    const newEntry = {
      id: Date.now(), 
      mood,
      note,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    };
    const docRef = await addDoc(collection(db, "moods"), newEntry);
    setHistory([{ ...newEntry, docId: docRef.id }, ...history]);
    setMood(null); setNote('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 transition-colors duration-500">
      <div className="flex-1 space-y-8">
        <header className="pb-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">Tracker</h1>
          <span className="text-3xl font-light text-zinc-400 dark:text-zinc-600">{history.length}</span>
        </header>

        {/* MOOD INPUT AREA */}
        <section className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${mood ? `${moodConfig[mood].bg} ${moodConfig[mood].border}` : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}`}>
          <div className="flex justify-between items-center mb-8 px-2">
            {Object.entries(moodConfig).map(([emoji, cfg]) => (
              <button key={emoji} onClick={() => setMood(emoji)} className="flex flex-col items-center gap-2 group outline-none">
                <span className={`text-4xl transition-all duration-300 ${mood === emoji ? 'scale-125' : 'opacity-30 group-hover:opacity-100'}`}>{emoji}</span>
                {/* FIXED: Label text color now flips between dark zinc and light zinc */}
                <span className={`text-[10px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 transition-opacity ${mood === emoji ? 'opacity-100' : 'opacity-0'}`}>
                  {cfg.label}
                </span>
              </button>
            ))}
          </div>

          {mood && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <textarea 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                className="w-full p-6 bg-white dark:bg-zinc-800 rounded-3xl border-none text-zinc-900 dark:text-zinc-50 shadow-sm focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 outline-none transition-colors"
                placeholder="Write something..."
              />
              <button onClick={handleLog} className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 ${moodConfig[mood].color}`}>
                Save Entry
              </button>
            </div>
          )}
        </section>

        {/* LOG HISTORY */}
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2.5rem] flex gap-6 relative overflow-hidden transition-colors duration-500">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${moodConfig[entry.mood]?.color}`} />
              <span className="text-4xl">{entry.mood}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* FIXED: History labels text color flips */}
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${moodConfig[entry.mood]?.text}`}>
                    {moodConfig[entry.mood]?.label}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">{entry.time} — {entry.date}</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">{entry.note || "No note added."}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CALENDAR SIDEBAR */}
      <aside className="lg:w-72 w-full">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors duration-500">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6 text-center">Activity Map</h4>
          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((day, i) => (
              <div 
                key={i} 
                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all duration-500
                  ${day.hasLog 
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900' 
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600'}
                `}
              >
                {day.dayNum}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Tracker;