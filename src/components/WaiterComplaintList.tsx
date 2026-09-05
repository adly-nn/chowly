"use client";

import { useTransition } from "react";
import { resolveComplaint } from "@/actions/complaints";

interface ComplaintVM {
  ComplaintID: string;
  ComplaintDescription: string;
  ComplaintDateTime: Date;
  ComplaintStatus: string;
}

export function WaiterComplaintList({ orderId, complaints }: { orderId: string; complaints: ComplaintVM[] }) {
  const [isPending, startTransition] = useTransition();

  if (complaints.length === 0) return null;

  return (
    <section className="rounded-xl border border-black/5 bg-chow-surface p-4">
      <h2 className="font-semibold text-chow-ink">Complaints</h2>
      <ul className="mt-3 space-y-2">
        {complaints.map((c) => (
          <li key={c.ComplaintID} className="rounded-lg bg-black/[0.03] p-3 text-sm">
            <p className="text-chow-ink">{c.ComplaintDescription}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-chow-muted">
                {c.ComplaintDateTime.toLocaleString("en-NG")} · {c.ComplaintStatus === "OPEN" ? "Open" : "Resolved"}
              </span>
              {c.ComplaintStatus === "OPEN" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => resolveComplaint(c.ComplaintID, orderId))}
                  className="shrink-0 rounded-full bg-chow-green-wash px-3 py-1 text-xs font-semibold text-chow-green disabled:opacity-60"
                >
                  Mark resolved
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
