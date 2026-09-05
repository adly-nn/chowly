"use client";

import { useState, useTransition } from "react";
import { assignStaff, markServed } from "@/actions/waiter";

interface StaffOption {
  id: string;
  label: string;
}

export function AssignmentPanel({
  orderId,
  chefId,
  bartenderId,
  chefs,
  bartenders,
  assigned,
  alreadyServed,
}: {
  orderId: string;
  chefId: string | null;
  bartenderId: string | null;
  chefs: StaffOption[];
  bartenders: StaffOption[];
  assigned: boolean;
  alreadyServed: boolean;
}) {
  const [chef, setChef] = useState(chefId ?? "");
  const [bartender, setBartender] = useState(bartenderId ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function saveAssignment() {
    if (!chef || !bartender) return;
    setError(null);
    startTransition(async () => {
      try {
        await assignStaff(orderId, chef, bartender);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save the assignment.");
      }
    });
  }

  function serveOrder() {
    setError(null);
    startTransition(async () => {
      try {
        await markServed(orderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not mark this order served.");
      }
    });
  }

  return (
    <section className="rounded-xl border border-black/5 bg-chow-surface p-4">
      <h2 className="font-semibold text-chow-ink">Assign staff</h2>

      <label className="mt-3 block text-sm font-medium text-chow-ink" htmlFor="chef-select">
        Chef
      </label>
      <select
        id="chef-select"
        value={chef}
        disabled={alreadyServed}
        onChange={(e) => setChef(e.target.value)}
        className="mt-1 w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-chow-ink disabled:opacity-60"
      >
        <option value="" disabled>
          Select a chef
        </option>
        {chefs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      <label className="mt-3 block text-sm font-medium text-chow-ink" htmlFor="bartender-select">
        Bartender
      </label>
      <select
        id="bartender-select"
        value={bartender}
        disabled={alreadyServed}
        onChange={(e) => setBartender(e.target.value)}
        className="mt-1 w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-chow-ink disabled:opacity-60"
      >
        <option value="" disabled>
          Select a bartender
        </option>
        {bartenders.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-2 text-sm text-chow-alert">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveAssignment}
          disabled={isPending || alreadyServed || !chef || !bartender}
          className="rounded-lg bg-chow-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Save assignment
        </button>
        <button
          type="button"
          onClick={serveOrder}
          disabled={isPending || alreadyServed || !assigned}
          title={!assigned ? "Save the chef and bartender assignment first" : undefined}
          className="rounded-lg bg-chow-yellow px-4 py-2 text-sm font-semibold text-chow-ink disabled:opacity-60"
        >
          {alreadyServed ? "Already served" : "Mark as served"}
        </button>
      </div>
    </section>
  );
}
