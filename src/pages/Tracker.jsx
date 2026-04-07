import React, { useState, useRef, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, getDocs, query, deleteDoc, doc } from "firebase/firestore";

const Tracker = () => {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);
  const [filterDate, setFilterDate] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [milestone, setMilestone] = useState({ show: false, count: 0, sentiment: 'neutral' });
  const [toast, setToast] = useState('');

  const textareaRef = useRef(null);

  // Fetch and Manual Sort
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, "moods")); 
        const querySnapshot = await getDocs(q);
        const loadedLogs = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id 
        }));
        const sortedLogs = loadedLogs.sort((a, b) => b.id - a.id);
        setHistory(sortedLogs);
      } catch (error) {
        console.error("Database connection failed: ", error);
        showToast("Connection error.");
      }
    };
    fetchLogs();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note]);

  const moodConfig = {
    '🌟': { label: 'Radiant', color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', msg: 'You are radiating warmth today.' },
    '😊': { label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', msg: 'A solid, gentle day.' },
    '😐': { label: 'Still', color: 'bg-zinc-400', text: 'text-zinc-500', bg: 'bg-zinc-50', border: 'border-zinc-200', msg: 'Just breathing is enough.' },
    '😔': { label: 'Heavy', color: 'bg-sky-500', text: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', msg: 'It is heavy right now.' },
    '🌧️': { label: 'Overwhelmed', color: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', msg: 'You are surviving a storm.' },
  };

  const getCalendarDays = () => {
    const days = [];
    for (let i = 20; i >= 0; i--) { 
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      const dayNum = d.getDate();
      const hasLog = history.some(entry => entry.date === dateStr);
      days.push({ dateStr, dayNum, hasLog });
    }
    return days;
  };

  const analyzeSentiment = (logs) => {
    let score = 0;
    let stillCount = 0;
    const recentLogs = logs.slice(0, 10);
    recentLogs.forEach(log => {
      if (['🌟', '😊'].includes(log.mood)) score++;
      if (['😔', '🌧️'].includes(log.mood)) score--;
      if (log.mood === '😐') stillCount++;
    });
    if (stillCount >= 5) return 'numbed';
    return score > 0 ? 'positive' : score < 0 ? 'comforting' : 'neutral';
  };

  const displayedHistory = filterDate 
    ? history.filter(item => item.date === filterDate)
    : history;

  const handleLog = async () => {
    if (!mood) return;
    const selectedMood = moodConfig[mood];
    const newEntry = {
      id: Date.now(), 
      mood,
      note,
      config: selectedMood,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    };
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "moods"), newEntry);
      const historyWithNewDoc = [{ ...newEntry, docId: docRef.id }, ...history];
      setHistory(historyWithNewDoc);
      setMood(null);
      setNote('');
      if (historyWithNewDoc.length > 0 && historyWithNewDoc.length % 10 === 0) {
        const trend = analyzeSentiment(historyWithNewDoc);
        setMilestone({ show: true, count: historyWithNewDoc.length, sentiment: trend });
      } else {
        showToast(selectedMood.msg);
      }
    } catch (e) {
      showToast("Failed to save.");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDoc(doc(db, "moods", docId));
      setHistory(history.filter(e => e.docId !== docId));
      setDeleteConfirm(null);
    } catch (e) { console.error(e); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 mb-20 font-sans text-zinc-900 flex flex-col lg:flex-row gap-12 items-start">
      
      <div className="flex-1 w-full space-y-12">
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4">
            <div className="bg-zinc-900 text-white/90 px-6 py-3 rounded-2xl text-sm shadow-2xl flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              {toast}
            </div>
          </div>
        )}

        {milestone.show && (
          <div className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-in fade-in duration-1000">
            <div className={`max-w-md w-full p-10 rounded-[2rem] shadow-2xl text-center space-y-6 border ${
              milestone.sentiment === 'positive' ? 'bg-gradient-to-b from-amber-50 to-white border-amber-100' : 
              milestone.sentiment === 'numbed' ? 'bg-gradient-to-b from-zinc-100 to-white border-zinc-200' :
              'bg-gradient-to-b from-sky-50 to-white border-sky-100'
            }`}>
              <div className="text-8xl font-light tracking-tighter">{milestone.count}</div>
              <h2 className="text-xl font-bold">Reflections Logged</h2>
              <p className="text-zinc-600">
                {milestone.sentiment === 'positive' && "It looks like you've had a lot of bright moments lately."}
                {milestone.sentiment === 'comforting' && "It’s been a heavy season, but you keep showing up."}
                {milestone.sentiment === 'numbed' && "You've been in a bit of a gray area lately."}
                {milestone.sentiment === 'neutral' && "Your journey is unfolding steadily."}
              </p>
              <button onClick={() => setMilestone({...milestone, show:false})} className="mt-8 px-8 py-3 bg-zinc-900 text-white rounded-xl font-semibold w-full">Continue Journey</button>
            </div>
          </div>
        )}

        <header className="pt-8 pb-4 border-b border-zinc-100 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">MindSpace</h1>
            <p className="text-zinc-500 mt-1 text-sm">Take a breath. Check in with yourself.</p>
          </div>
          {/* Reverted style with updated hex color */}
          <div className="text-right">
            <p className="text-3xl font-light tracking-tighter text-[#8c8c8c]">{history.length}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Total Logs</p>
          </div>
        </header>

        <section className={`p-6 sm:p-8 rounded-[2rem] transition-all duration-700 shadow-sm border ${mood ? `${moodConfig[mood].bg} ${moodConfig[mood].border}` : 'bg-zinc-50 border border-zinc-100'}`}>
          <div className="flex justify-between items-center mb-10 px-2">
            {Object.entries(moodConfig).map(([emoji, cfg]) => (
              <button key={emoji} onClick={() => setMood(emoji)} className={`flex flex-col items-center gap-3 transition-all ${mood === emoji ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                <span className="text-4xl sm:text-5xl">{emoji}</span>
                <span className={`text-xs font-semibold ${mood === emoji ? 'opacity-100' : 'opacity-0'}`}>{cfg.label}</span>
              </button>
            ))}
          </div>
          {mood && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <textarea ref={textareaRef} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's weighing on your mind?" className="w-full p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 focus:border-zinc-300 resize-none overflow-hidden shadow-sm" rows="1" />
              <button onClick={handleLog} disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-semibold text-white shadow-sm transition-all ${isSubmitting ? 'bg-zinc-300' : `${moodConfig[mood].color} hover:opacity-90`}`}>
                {isSubmitting ? 'Syncing...' : 'Save Reflection'}
              </button>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[11px] font-bold text-zinc-400 tracking-[0.2em] uppercase flex items-center gap-2">
              {filterDate ? (
                <>
                  Viewing: {filterDate} 
                  <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md lowercase tracking-normal">({displayedHistory.length} logs)</span>
                </>
              ) : "Your Journey"}
            </h3>
            {filterDate && (
              <button onClick={() => setFilterDate(null)} className="text-xs font-bold text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors">
                Show All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {displayedHistory.length > 0 ? (
              displayedHistory.map((entry) => (
                <div key={entry.id} className="group relative bg-white border border-zinc-100 p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all flex gap-5 overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${moodConfig[entry.mood]?.color || 'bg-zinc-200'}`} />
                  <div className="text-4xl flex-shrink-0 leading-none">{entry.mood}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${moodConfig[entry.mood]?.text}`}>
                          {moodConfig[entry.mood]?.label}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
                        <span className="text-[10px] font-medium text-zinc-400 uppercase">{entry.time}</span>
                      </div>
                      {deleteConfirm === entry.docId ? (
                        <div className="flex gap-3 bg-white px-2 py-1 rounded shadow-sm border border-zinc-100 animate-in fade-in">
                          <button onClick={() => handleDelete(entry.docId)} className="text-[10px] font-bold text-red-500 uppercase">Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-[10px] font-bold text-zinc-500 uppercase">Keep</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(entry.docId)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-700 text-sm leading-relaxed pr-4">
                      {entry.note || <span className="italic text-zinc-300 font-light">A moment captured in silence.</span>}
                    </p>
                    <div className="mt-3 text-[10px] font-semibold text-zinc-300 uppercase tracking-tighter">{entry.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-[2rem] py-20 text-center text-zinc-400 italic text-sm">
                No reflections found for this selection.
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="lg:w-72 space-y-8 lg:sticky lg:top-8 h-fit w-full">
        <div className="bg-white p-7 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <header className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Activity Map</h4>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </header>

          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((day, i) => (
              <button 
                key={i}
                onClick={() => setFilterDate(day.dateStr)}
                className={`aspect-square rounded-xl flex items-center justify-center text-xs transition-all relative
                  ${filterDate === day.dateStr 
                    ? 'bg-zinc-900 text-white font-bold scale-110 shadow-lg z-10' 
                    : day.hasLog 
                      ? 'bg-zinc-200 text-zinc-900 font-bold hover:bg-zinc-300' 
                      : 'bg-zinc-50 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500'}
                `}
              >
                {day.dayNum}
              </button>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-50 space-y-3">
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>Active Day</span>
            </div>
            <p className="text-[10px] leading-relaxed text-zinc-400 font-medium">
              Click any date to isolate your thoughts from that specific day.
            </p>
          </div>
        </div>
      </aside>

    </div>
  );
};

export default Tracker;