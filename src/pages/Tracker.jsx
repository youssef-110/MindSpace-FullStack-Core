import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, getDocs, query, deleteDoc, doc } from "firebase/firestore";

export default function Tracker() {
  const [mood, setMood] = useState('😊');
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);

  // Fetch from Firebase
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, "moods")); 
        const querySnapshot = await getDocs(q);
        const loadedLogs = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
        // Sort by newest first based on timestamp
        setHistory(loadedLogs.sort((a, b) => b.timestamp - a.timestamp));
      } catch (e) { console.error("Firebase error", e); }
    };
    fetchLogs();
  }, []);

  // Add to Firebase
  const handleSave = async () => {
    if (!note.trim()) return;
    const newEntry = {
      mood,
      note,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    try {
      const docRef = await addDoc(collection(db, "moods"), newEntry);
      setHistory([{ ...newEntry, docId: docRef.id }, ...history]);
      setNote('');
    } catch (e) { console.error("Error adding document: ", e); }
  };

  // Delete from Firebase
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "moods", id));
      setHistory(history.filter(entry => entry.docId !== id));
    } catch (e) { console.error("Error deleting document: ", e); }
  };

  const moodOptions = ['🌟', '😊', '😐', '🌧️', '🌪️'];

  // Generate 30 days for the Activity Map
  const getCalendarDays = () => {
    const days = [];
    const today = new Date().toLocaleDateString();
    
    for (let i = 1; i <= 30; i++) {
      // Check if history has an entry (just visually turning on lights for logged days)
      // For simplicity, we just check if we have enough logs to fill the squares
      const hasLog = history.length >= i; 
      days.push({ id: i, hasLog });
    }
    return days;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto py-10">
      
      {/* LEFT COLUMN: Input & Feed */}
      <div className="flex-1 space-y-8">
        
        {/* Input Box */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-md transition-colors duration-500">
          <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">How are you feeling?</h2>
          
          <div className="flex gap-4 mb-6">
            {moodOptions.map(m => (
              <button 
                key={m} 
                onClick={() => setMood(m)}
                className={`text-3xl p-3 rounded-2xl transition-all ${mood === m ? 'bg-zinc-200 dark:bg-zinc-800 scale-110 shadow-inner' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Jot down a quick thought..."
            className="w-full p-4 mb-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none text-zinc-900 dark:text-white placeholder-zinc-400"
            rows="3"
          />
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Log Mood
          </button>
        </div>

        {/* History Feed */}
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.docId} className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-4 transition-colors duration-500 relative group">
              <div className="text-4xl">{entry.mood}</div>
              <div className="flex-1">
                <span className="block text-xs font-bold text-zinc-400 mb-1">{entry.date}</span>
                <p className="text-zinc-800 dark:text-zinc-200">{entry.note}</p>
              </div>
              
              {/* DELETE BUTTON */}
              <button 
                onClick={() => handleDelete(entry.docId)}
                className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-opacity font-bold text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Activity Map */}
      <aside className="lg:w-72 w-full">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-md transition-colors duration-500">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 text-center">30-Day Activity</h4>
          <div className="grid grid-cols-5 gap-2">
            {getCalendarDays().map((day) => (
              <div 
                key={day.id} 
                className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-500 ${
                  day.hasLog 
                    ? 'bg-zinc-900 dark:bg-zinc-100 shadow-sm' 
                    : 'bg-zinc-100 dark:bg-zinc-800/50'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}