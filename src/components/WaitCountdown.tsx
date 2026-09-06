"use client";

import { useEffect, useState } from "react";

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const past = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const mm = Math.floor(abs / 60);
  const ss = abs % 60;
  return `${past ? "+" : ""}${mm}:${String(ss).padStart(2, "0")}`;
}

/**
 * The one memorable visual in the app (see design brief §6.4): a large,
 * live-counting wait timer that shifts from green through yellow to red as
 * the estimate approaches and passes zero. Yellow is only ever a fill with
 * dark text on it, never text on a light background, so it stays readable.
 *
 * Renders a static placeholder until mounted: computing Date.now() during
 * the initial render would make the server-rendered HTML and the client's
 * first hydration pass disagree (a few hundred ms apart), which React
 * reports as a hydration mismatch. The real value is filled in by the
 * effect below, immediately after mount.
 */
export function WaitCountdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const deadlineMs = new Date(deadline).getTime();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tick = () => setRemaining(deadlineMs - Date.now());
    tick();

    // Reduced motion: re-evaluate occasionally so the colour still reflects
    // reality, without animating the digits every second.
    const intervalMs = media.matches ? 30_000 : 1_000;
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [deadline]);

  if (remaining === null) {
    return (
      <div className="rounded-xl bg-chow-green-wash px-5 py-4 text-chow-green">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Estimated wait</p>
        <p className="tabular text-4xl font-bold leading-tight" style={{ letterSpacing: "-0.02em" }}>
          --:--
        </p>
      </div>
    );
  }

  const isPast = remaining <= 0;
  const isWarning = !isPast && remaining <= 5 * 60_000;

  const styles = isPast
    ? "bg-chow-alert text-white"
    : isWarning
      ? "bg-chow-yellow text-chow-ink"
      : "bg-chow-green-wash text-chow-green";

  return (
    <div className={`rounded-xl px-5 py-4 transition-colors duration-500 ${styles}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
        {isPast ? "Past estimated wait" : "Estimated wait"}
      </p>
      <p className="tabular text-4xl font-bold leading-tight" style={{ letterSpacing: "-0.02em" }}>
        {formatDuration(remaining)}
      </p>
    </div>
  );
}
