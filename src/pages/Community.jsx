import React from 'react';

const Post = ({ user, content, time }) => (
  <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-500">
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">@{user}</span>
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{time}</span>
    </div>
    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{content}</p>
  </div>
);

export default function Community() {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white mb-2">The Abyss</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Share anonymously, reflect together.</p>
      </header>

      <div className="mb-12">
        <textarea 
          placeholder="What's on your mind?"
          className="w-full p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all outline-none"
        />
        <div className="flex justify-end mt-4">
          <button className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-full shadow-lg transition-transform active:scale-95">
            Post
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <Post user="anon_01" content="Sometimes it's okay not to be productive. Rest is a form of progress." time="2h ago" />
        <Post user="mind_hex" content="The way we speak to ourselves matters more than we think." time="5h ago" />
      </div>
    </div>
  );
}