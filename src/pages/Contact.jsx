import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Icon, PageHeader } from "../components/ui";

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

  if (state === "sent") {
    return (
      <div className="mx-auto max-w-xl" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand-text">
          <Icon name="check" />
        </span>
        <h1 className="mt-6 text-[2.5rem] sm:text-5xl">Message sent</h1>
        <p className="lead mt-4">Thanks. {replyTo ? "We'll reply to the address you gave." : "You didn't leave a reply address, so we won't be able to answer directly."}</p>
        <Link to="/" className="btn btn-ghost mt-8">Back to the home page</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Contact">
        <p className="lead mt-4">
          Questions about your data, a problem with the site, or an idea. For privacy requests, signing in first lets you download or delete everything
          yourself from your <Link to="/account" className="link">account page</Link>.
        </p>
      </PageHeader>
      <form onSubmit={submit} className="card grid gap-5 p-5 sm:p-8">
        <label className="field">
          What's it about?
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input">
            {TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="field">
          Message
          <textarea required minLength={5} maxLength={3000} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="input" />
        </label>
        <label className="field">
          <span>Email for a reply <span className="font-normal text-ink-3">(optional)</span></span>
          <input type="email" maxLength={200} autoComplete="email" inputMode="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className="input" aria-describedby="reply-hint" />
          <span id="reply-hint" className="font-normal text-ink-3">Only used to answer this message.</span>
        </label>
        <label className="hidden" aria-hidden="true">
          Leave this empty
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
        {error && (
          <p className="flex items-start gap-2 rounded-[var(--r-md)] bg-rose-soft p-3.5 text-sm font-medium text-rose" role="alert">
            <Icon name="alert" size={20} />
            {error}
          </p>
        )}
        <button className="btn btn-primary sm:justify-self-start" disabled={state === "sending" || message.trim().length < 5}>
          {state === "sending" ? "Sending…" : "Send message"}
          {state !== "sending" && <Icon name="send" size={18} />}
        </button>
      </form>
    </div>
  );
}
