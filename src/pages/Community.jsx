import React, { useState } from 'react';

export default function Community() {
  const [posts, setPosts] = useState([
    { id: 1, content: "Remember to drink water and take a deep breath today.", time: "Just now" }
  ]);
  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (newPost.trim() === "") return;
    const post = {
      id: Date.now(),
      content: newPost,
      time: "Just now"
    };
    setPosts([post, ...posts]);
    setNewPost(""); // Clear the box
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-700">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white mb-2">MindSpace Community</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">A safe space to share and reflect.</p>
      </header>

      {/* Input Area */}
      <div className="mb-10 p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-md transition-colors duration-500">
        <textarea 
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 bg-transparent text-zinc-900 dark:text-white outline-none resize-none placeholder-zinc-400"
          rows="3"
        />
        <div className="flex justify-end mt-4">
          <button 
            onClick={handlePost}
            className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed Area */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-500">
            <p className="text-zinc-800 dark:text-zinc-200 text-lg leading-relaxed">{post.content}</p>
            <span className="block mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">{post.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}