import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { load, save } from "../lib/storage";
import { detectCrisis } from "../lib/safety";
import CrisisModal from "../components/CrisisModal";

const anonNames = ["Quiet River", "Gentle Fern", "Warm Ember", "Soft Cloud", "Brave Sparrow", "Calm Tide", "Kind Willow", "Steady Oak", "Bright Moth", "Patient Moon"];

const seedPosts = [
  { id: "s1", author: "Gentle Fern", content: "Three months ago I couldn't get out of bed. Today I walked to the corner shop and back. It sounds like nothing. It's everything.", time: Date.now() - 86400000 * 2, hearts: 24, mine: false },
  { id: "s2", author: "Calm Tide", content: "Reminder that healing isn't linear. I had two great weeks and then yesterday was awful, and that doesn't erase the two weeks.", time: Date.now() - 86400000, hearts: 17, mine: false },
  { id: "s3", author: "Brave Sparrow", content: "Told my best friend about my anxiety for the first time. She said 'me too'. We'd both been hiding it for years. Talk to your people. 💛", time: Date.now() - 3600000 * 5, hearts: 31, mine: false },
];

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Community() {
  const [posts, setPosts] = useState(() => load("communityPosts", seedPosts));
  const [newPost, setNewPost] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);
  const [hearted, setHearted] = useState(() => load("heartedPosts", []));

  const persist = (next) => {
    setPosts(next);
    save("communityPosts", next);
  };

  const handlePost = () => {
    const text = newPost.trim();
    if (!text) return;
    if (detectCrisis(text)) setShowCrisis(true);
    const post = {
      id: `${Date.now()}`,
      author: anonNames[Math.floor(Math.random() * anonNames.length)],
      content: text,
      time: Date.now(),
      hearts: 0,
      mine: true,
    };
    persist([post, ...posts]);
    setNewPost("");
  };

  const toggleHeart = (id) => {
    const has = hearted.includes(id);
    const nextHearted = has ? hearted.filter((x) => x !== id) : [...hearted, id];
    setHearted(nextHearted);
    save("heartedPosts", nextHearted);
    persist(posts.map((p) => (p.id === id ? { ...p, hearts: p.hearts + (has ? -1 : 1) } : p)));
  };

  const deletePost = (id) => persist(posts.filter((p) => p.id !== id));

  return (
    <div className="max-w-2xl mx-auto">
      <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />

      <header className="mb-10 text-center">
        <h1 className="font-display text-5xl font-semibold text-zinc-900 dark:text-white mb-3">Community wall</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Anonymous by default. Share a win, a struggle, or a reminder someone else might need today.
        </p>
      </header>

      <div className="card p-6 mb-8">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What would you tell someone who feels the way you did at your lowest?"
          className="w-full p-4 bg-transparent text-zinc-900 dark:text-white outline-none resize-none placeholder-zinc-400 leading-relaxed"
          rows="3"
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-zinc-400 font-medium">{newPost.length}/500 · posted anonymously</span>
          <button onClick={handlePost} disabled={!newPost.trim()} className="btn-primary px-7 py-2.5 text-sm">
            Share
          </button>
        </div>
      </div>

      <div className="card p-4 mb-8 bg-teal-50/60 dark:bg-teal-950/15 border-teal-100 dark:border-teal-900/50 flex items-center gap-3">
        <span className="text-xl">🌱</span>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <span className="font-bold">House rules:</span> be kind, no advice-shaming, no diagnosing others.
          If a post worries you about someone's safety, point them to the <span className="font-bold">Resources</span> page.
        </p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="card p-6 group relative"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-300 to-indigo-400 flex items-center justify-center text-xs text-white font-black">
                  {post.author.split(" ").map((w) => w[0]).join("")}
                </span>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{post.author}</span>
                {post.mine && <span className="text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">you</span>}
                <span className="text-xs text-zinc-400 ml-auto">{timeAgo(post.time)}</span>
              </div>
              <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => toggleHeart(post.id)}
                  className={`flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer active:scale-90 ${
                    hearted.includes(post.id)
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-500"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-rose-400"
                  }`}
                >
                  {hearted.includes(post.id) ? "❤️" : "🤍"} {post.hearts}
                </button>
                {post.mine && (
                  <button onClick={() => deletePost(post.id)} className="text-xs font-bold text-zinc-300 dark:text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
