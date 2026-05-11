import React, { useState, useEffect, useRef } from 'react';

function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("http://localhost:8000/sync", { method: "POST" });
      alert("AI Memory Updated from /data folder!");
    } catch (err) {
      alert("Sync failed. Is backend running?");
    }
    setIsSyncing(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }) 
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'ai', content: data.answer }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'ai', content: "Error. Check backend." }]);
    }
    setLoading(false);
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[75vh] mt-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <span className="font-bold">MindSpace AI</span>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="text-xs bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-full hover:bg-zinc-300 transition-all"
        >
          {isSyncing ? "Syncing..." : "🔄 Sync Files"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-none' 
                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-tl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'ai' && (
                <button onClick={() => speak(msg.content)} className="mt-3 text-[11px] font-bold opacity-60 hover:opacity-100">
                  🔊 Play Audio
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-zinc-500 animate-pulse ml-2">AI is thinking...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-3">
          <input 
            className="flex-1 p-4 rounded-xl border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to your history..."
          />
          <button onClick={handleSend} className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-8 rounded-xl font-bold">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;