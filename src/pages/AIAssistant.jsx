import React, { useState, useEffect, useRef } from 'react';

function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom when a new message appears
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        // We now send the history so the AI remembers the conversation
        body: JSON.stringify({ message: input, history: messages }) 
      });
      const data = await res.json();
      
      const aiMessage = { role: 'ai', content: data.answer };
      setMessages([...newMessages, aiMessage]);
    } catch (err) {
      setMessages([...newMessages, { role: 'ai', content: "Error connecting to server. Is main.py running?" }]);
    }
    setLoading(false);
  };

  const speak = (text) => {
    window.speechSynthesis.cancel(); // Stops current audio if you click another button
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[75vh] mt-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 font-bold text-center text-zinc-800 dark:text-zinc-200">
        MindSpace AI Companion
      </div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 dark:text-zinc-400 mt-10">
            Send a message to start chatting with your AI.
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-none' 
                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              
              {/* PLAY AUDIO BUTTON (Only for AI) */}
              {msg.role === 'ai' && (
                <button 
                  onClick={() => speak(msg.content)}
                  className="mt-3 text-[11px] uppercase tracking-wider font-bold opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity"
                >
                  🔊 Play Audio
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse ml-2">AI is typing...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input 
            className="flex-1 p-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message and press Enter..."
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-8 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;