"use client";

import { useState, useTransition } from "react";
import { submitRating } from "@/actions/ratings";

interface RatingVM {
  RatingScore: number;
  RatingComment: string | null;
}

export function RatingPanel({ orderId, rating }: { orderId: string; rating: RatingVM | null }) {
  const [score, setScore] = useState(rating?.RatingScore ?? 0);
  const [comment, setComment] = useState(rating?.RatingComment ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function submit() {
    if (score < 1) return;
    setError(null);
    startTransition(async () => {
      try {
        await submitRating(orderId, score, comment);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save the rating.");
      }
    });
  }

  return (
    <section className="rounded-xl border border-black/5 bg-chow-surface p-4">
      <h2 className="font-semibold text-chow-ink">{rating ? "Your rating" : "Rate this order"}</h2>

      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating out of 5 stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={score === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => {
              setScore(n);
              setSaved(false);
            }}
            className="text-3xl leading-none"
          >
            <span className={n <= score ? "text-chow-yellow" : "text-black/15"}>★</span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          setSaved(false);
        }}
        placeholder="Optional comment"
        rows={2}
        className="mt-3 w-full rounded-lg border border-black/10 bg-white p-3 text-sm text-chow-ink placeholder:text-chow-muted"
      />

      {error && <p className="mt-2 text-sm text-chow-alert">{error}</p>}
      {saved && !error && <p className="mt-2 text-sm text-chow-green">Thanks — your rating was saved.</p>}

      <button
        type="button"
        onClick={submit}
        disabled={isPending || score < 1}
        className="mt-2 rounded-lg bg-chow-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Saving…" : rating ? "Update rating" : "Submit rating"}
      </button>
    </section>
  );
}
