import { useRef, useState } from "react";
import { Icon } from "../ui";
import { exportData, importData } from "../../lib/storage";
import { getCheckins, todayKey } from "../../lib/checkin";
import { plural } from "./shape";

// Download everything on this device as one JSON file, or bring a backup in.
export default function Backup({ hasData, onImported }) {
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportData()], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `mindspace-backup-${todayKey()}.json` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const before = getCheckins().length;
      const n = importData(await file.text());
      const added = getCheckins().length - before;
      setMsg({ ok: true, text: `Imported ${plural(n, "result")}${added ? ` and ${plural(added, "check-in")}` : ""}.` });
      onImported();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof SyntaxError ? "That file isn't valid JSON." : err.message });
    }
    e.target.value = "";
  };

  return (
    <section aria-labelledby="backup-heading" className="card p-5 sm:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-xl">
          <h2 id="backup-heading" className="text-[1.75rem]">
            Back up or move your results
          </h2>
          <p className="mt-2 text-ink-2">Clearing your browser data deletes your results. Download a backup file to keep them or move them to another device. The file also holds your lesson progress and daily check-ins.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-ghost" onClick={download} disabled={!hasData}>
            <Icon name="download" size={19} />
            Download backup
          </button>
          <button type="button" className="btn btn-soft" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={upload} aria-label="Import backup file" />
        </div>
      </div>
      {msg && (
        <p className={`mt-5 flex items-center gap-2 font-medium ${msg.ok ? "text-ink" : "text-rose"}`} role="status">
          <Icon name={msg.ok ? "check" : "alert"} size={18} />
          {msg.text}
        </p>
      )}
    </section>
  );
}
