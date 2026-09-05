"use client";

import { useState, useTransition } from "react";
import { submitComplaint } from "@/actions/complaints";

interface ComplaintVM {
  ComplaintID: string;
  ComplaintDescription: string;
  ComplaintDateTime: Date;
  ComplaintStatus: string;
}

function formatTime(date: Date): string {
  return date.toLocaleString("en-NG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function ComplaintPanel({
  orderId,
  complaints,
  prominent,
}: {
  orderId: string;
  complaints: ComplaintVM[];
  prominent: boolean;
}) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await submitComplaint(orderId, text);
        setText("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not submit the complaint.");
      }
    });
  }

  return (
    <section
      className={`rounded-xl border p-4 ${
        prominent ? "border-chow-alert/30 bg-chow-alert/5" : "border-black/5 bg-chow-surface"
      }`}
    >
      <h2 className={`font-semibold ${prominent ? "text-chow-alert" : "text-chow-ink"}`}>
        {prominent ? "This order is running late — tell us what happened" : "Complaint"}
      </h2>

      {complaints.length > 0 && (
        <ul className="mt-3 space-y-2">
          {complaints.map((c) => (
            <li key={c.ComplaintID} className="rounded-lg bg-black/[0.03] p-3 text-sm">
              <p className="text-chow-ink">{c.ComplaintDescription}</p>
              <p className="mt-1 text-xs text-chow-muted">
                {formatTime(c.ComplaintDateTime)} · {c.ComplaintStatus === "OPEN" ? "Open" : "Resolved"}
              </p>
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What went wrong with this order?"
        rows={3}
        className="mt-3 w-full rounded-lg border border-black/10 bg-white p-3 text-sm text-chow-ink placeholder:text-chow-muted"
      />
      {error && <p className="mt-2 text-sm text-chow-alert">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={isPending || !text.trim()}
        className="mt-2 rounded-lg bg-chow-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Submit complaint"}
      </button>
    </section>
  );
}
