import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, getDocs, query, deleteDoc, doc, orderBy } from "firebase/firestore";

export default function Tracker() {
  const [mood, setMood] = useState('😊');
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);

  // Fetch from Firebase with proper sorting
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Querying with orderBy ensures the latest entries are fetched first
        const q = query(collection(db, "moods"), orderBy("timestamp", "desc")); 
        const querySnapshot = await getDocs(q);
        const loadedLogs = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
        setHistory(loadedLogs);
      } catch (e) { 
        console.error("Firebase error", e); 
      }
    };
    fetchLogs();
  }, []);

  // Add to Firebase
  const handleSave = async () => {
    if (!note.trim()) return;
    
    const now = new Date();
    const todayNum = now.getDate(); 
    
    const newEntry = {
      mood,
      note,
      date: now.toLocaleDateString(),
      dayOfMonth: todayNum, // Stores the specific day of the month (1-31)
      timestamp: Date.now()
    };
    
    try {
      const docRef = await addDoc(collection(db, "moods"), newEntry);
      // Update local state immediately so the UI feels fast
      setHistory([{ ...newEntry, docId: docRef.id }, ...history]);
      setNote('');
    } catch (e) { 
      console.error("Error adding document: ", e); 
    }
  };

  // Delete from Firebase
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "moods", id));
      setHistory(history.filter(entry => entry.docId !== id));
    } catch (e) { 
      console.error("Error deleting document: ", e); 
    }
  };

  const moodOptions = ['🌟', '😊', '😐', '🌧️', '🌪️'];

  // Generate 31 days for the calendar view
  const getCalendarDays = () => {
    const days = [];
    // Extract unique days that have logs from the current month's history
    const loggedDays = history.map(entry => entry.dayOfMonth);

    for (let i = 1; i <= 31; i++) {
      const hasLog = loggedDays.includes(i); 
      days.push({ id: i, hasLog });
    }
    return days;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto py-10 animate-in fade-in duration-700">
      
      {/* LEFT COLUMN: Input & Feed */}
      <div className="flex-1 space-y-8">
        
        {/* Mood Input Card */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-md transition-colors duration-500">
          <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">How are you feeling?</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {moodOptions.map(m => (
              <button 
                key={m} 
                onClick={() => setMood(m)}
                className={`text-3xl p-3 rounded-2xl transition-all cursor-pointer ${
                  mood === m 
                    ? 'bg-zinc-100 dark:bg-zinc-800 scale-110 shadow-inner ring-2 ring-zinc-200 dark:ring-zinc-700' 
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 opacity-60 hover:opacity-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Jot down a quick thought..."
            className="w-full p-4 mb-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all"
            rows="3"
          />
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Log Mood
          </button>
        </div>

        {/* History Feed */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-4">Recent Logs</h3>
          {history.map((entry) => (
            <div key={entry.docId} className="group p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-4 transition-colors duration-500 relative">
              <div className="text-4xl select-none">{entry.mood}</div>
              <div className="flex-1 pr-12">
                <span className="block text-xs font-bold text-zinc-400 mb-1">{entry.date}</span>
                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{entry.note}</p>
              </div>
              
              {/* Delete Button - Visible on hover */}
              <button 
                onClick={() => handleDelete(entry.docId)}
                className="absolute top-6 right-6 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-all font-bold text-xs bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
          
          {history.length === 0 && (
            <div className="text-center py-20 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">No moods logged yet. Start tracking above!</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Activity Map */}
      <aside className="lg:w-80 w-full">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-md transition-colors duration-500 sticky top-32">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6 text-center">Monthly Activity</h4>
          
          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((day) => (
              <div 
                key={day.id} 
                title={`Day ${day.id}`}
                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all duration-500 select-none ${
                  day.hasLog 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md scale-110 z-10' 
                    : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-600'
                }`}
              >
                {day.id}
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
              <span>Total Logs</span>
              <span className="text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                {history.length}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}