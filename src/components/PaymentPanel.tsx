"use client";

import { useState, useTransition } from "react";
import { recordPayment } from "@/actions/payments";
import { formatNaira } from "@/lib/money";

interface PaymentVM {
  PaymentID: string;
  PaymentAmount: number;
  PaymentMethod: string;
  PaymentDateTime: Date;
}

function formatTime(date: Date): string {
  return date.toLocaleString("en-NG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function PaymentPanel({
  orderId,
  orderAmount,
  orderStatus,
  payment,
}: {
  orderId: string;
  orderAmount: number;
  orderStatus: string;
  payment: PaymentVM | null;
}) {
  const [method, setMethod] = useState<"Card" | "Transfer" | "Cash">("Card");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pay() {
    setError(null);
    startTransition(async () => {
      try {
        await recordPayment(orderId, method);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment could not be recorded.");
      }
    });
  }

  if (orderStatus === "PAID" && payment) {
    return (
      <section className="rounded-xl border border-chow-green/20 bg-chow-green-wash p-4">
        <h2 className="font-semibold text-chow-green">Receipt</h2>
        <span className="mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-chow-green">
          Demo payment — no money moves
        </span>
        <dl className="mt-3 space-y-1 text-sm text-chow-ink">
          <div className="flex justify-between">
            <dt className="text-chow-muted">Payment code</dt>
            <dd className="font-medium">{payment.PaymentID}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-chow-muted">Method</dt>
            <dd className="font-medium">{payment.PaymentMethod}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-chow-muted">Amount</dt>
            <dd className="tabular font-semibold">{formatNaira(payment.PaymentAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-chow-muted">Paid at</dt>
            <dd className="tabular font-medium">{formatTime(payment.PaymentDateTime)}</dd>
          </div>
        </dl>
      </section>
    );
  }

  if (orderStatus !== "SERVED") {
    return (
      <section className="rounded-xl border border-black/5 bg-chow-surface p-4">
        <h2 className="font-semibold text-chow-ink">Payment</h2>
        <p className="mt-1 text-sm text-chow-muted">
          Payment unlocks once your order has been served — the waiter marks that after handing it over.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-black/5 bg-chow-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-chow-ink">Payment</h2>
        <span className="rounded-full bg-chow-alert-wash px-2 py-0.5 text-xs font-semibold text-chow-alert">
          Demo payment — no money moves
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {(["Card", "Transfer", "Cash"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            aria-pressed={method === m}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              method === m ? "border-chow-green bg-chow-green-wash text-chow-green" : "border-black/10 text-chow-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {error && <p className="mt-2 text-sm text-chow-alert">{error}</p>}

      <button
        type="button"
        onClick={pay}
        disabled={isPending}
        className="mt-3 w-full rounded-lg bg-chow-yellow px-4 py-2.5 font-semibold text-chow-ink disabled:opacity-60"
      >
        {isPending ? "Recording payment…" : `Pay ${formatNaira(orderAmount)} now`}
      </button>
    </section>
  );
}
