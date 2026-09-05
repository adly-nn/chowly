"use client";

import { useTransition } from "react";
import { switchToCustomer, switchToWaiter } from "@/actions/session";

interface Person {
  id: string;
  label: string;
}

export function RoleSwitch({
  role,
  customerId,
  waiterId,
  customers,
  waiters,
}: {
  role: "customer" | "waiter";
  customerId: string;
  waiterId: string;
  customers: Person[];
  waiters: Person[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-full bg-white/15 p-1" role="group" aria-label="Switch role">
        <button
          type="button"
          disabled={isPending}
          aria-pressed={role === "customer"}
          onClick={() => startTransition(() => switchToCustomer(customerId))}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            role === "customer" ? "bg-chow-yellow text-chow-ink" : "text-white/80 hover:text-white"
          }`}
        >
          Customer
        </button>
        <button
          type="button"
          disabled={isPending}
          aria-pressed={role === "waiter"}
          onClick={() => startTransition(() => switchToWaiter(waiterId))}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            role === "waiter" ? "bg-chow-yellow text-chow-ink" : "text-white/80 hover:text-white"
          }`}
        >
          Waiter
        </button>
      </div>

      {role === "customer" ? (
        <select
          aria-label="Choose which customer you are"
          value={customerId}
          disabled={isPending}
          onChange={(e) => startTransition(() => switchToCustomer(e.target.value))}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id} className="text-chow-ink">
              {c.label}
            </option>
          ))}
        </select>
      ) : (
        <select
          aria-label="Choose which waiter you are"
          value={waiterId}
          disabled={isPending}
          onChange={(e) => startTransition(() => switchToWaiter(e.target.value))}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white"
        >
          {waiters.map((w) => (
            <option key={w.id} value={w.id} className="text-chow-ink">
              {w.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
