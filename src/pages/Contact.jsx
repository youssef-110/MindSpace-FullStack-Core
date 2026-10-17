import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TOPICS = [
  ["privacy", "My data or privacy"],
  ["problem", "Something isn't working"],
  ["feedback", "Feedback or an idea"],
  ["other", "Something else"],
];

export default function Contact() {
  const [topic, setTopic] = useState("feedback");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState(""); // filled only by bots
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (trap) return setState("sent");
    setState("sending");
    setError("");
    const { error } = await supabase.from("contact_messages").insert({ topic, reply_to: replyTo.trim() || null, message: message.trim() });
    if (error) {
      setState("idle");
      setError(/too many/i.test(error.message) ? "We're getting a lot of messages right now. Please try again in an hour." : "Your message didn't send. Check your connection and try again.");
      return;
    }
    setState("sent");
  }

  const field = "mt-1.5 block w-full rounded-[8px] border border-line bg-surface px-3.5 text-base focus:border-brand";
  if (state === "sent") {
    return (
      <div className="mx-auto max-w-xl py-16">
        <h1 className="text-4xl font-semibold">Message sent</h1>
        <p className="mt-3 text-ink-2">Thanks. {replyTo ? "We'll reply to the address you gave." : "You didn't leave a reply address, so we won't be able to answer directly."}</p>
        <Link to="/" className="btn btn-quiet mt-6">Back to the home page</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl py-10">
      <h1 className="text-4xl sm:text-5xl font-semibold">Contact</h1>
      <p className="mt-3 text-ink-2">
        Questions about your data, a problem with the site, or an idea. For privacy requests, signing in first lets you download or delete everything
        yourself from your <Link to="/account" className="link">account page</Link>.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block">
          <span className="font-bold">What's it about?</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`${field} min-h-[48px]`}>
            {TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="font-bold">Message</span>
          <textarea required minLength={5} maxLength={3000} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={`${field} py-3`} />
        </label>
        <label className="block">
          <span className="font-bold">Email for a reply</span> <span className="text-ink-2">(optional)</span>
          <input type="email" maxLength={200} autoComplete="email" inputMode="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className={`${field} min-h-[48px]`} />
          <span className="mt-1 block text-sm text-ink-2">Only used to answer this message.</span>
        </label>
        <label className="hidden" aria-hidden="true">
          Leave this empty
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
        {error && <p className="font-bold text-rose" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={state === "sending" || message.trim().length < 5}>
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
