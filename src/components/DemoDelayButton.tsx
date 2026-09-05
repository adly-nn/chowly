"use client";

import { useTransition } from "react";
import { simulateDelay } from "@/actions/demo";

export function DemoDelayButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => simulateDelay(orderId))}
      className="rounded-lg border border-dashed border-chow-muted/40 px-3 py-2 text-xs font-medium text-chow-muted hover:border-chow-alert hover:text-chow-alert disabled:opacity-60"
    >
      {isPending ? "Simulating…" : "Simulate delay (demo) — back-dates this order by 45 min"}
    </button>
  );
}
