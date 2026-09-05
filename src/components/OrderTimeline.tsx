interface TimelineOrder {
  OrderDateTime: Date;
  OrderPreparingAt: Date | null;
  OrderServedAt: Date | null;
  Payment: { PaymentDateTime: Date } | null;
}

function formatTime(date: Date): string {
  return date.toLocaleString("en-NG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function OrderTimeline({ order }: { order: TimelineOrder }) {
  const steps = [
    { label: "Placed", at: order.OrderDateTime },
    { label: "Preparing", at: order.OrderPreparingAt },
    { label: "Served", at: order.OrderServedAt },
    { label: "Paid", at: order.Payment?.PaymentDateTime ?? null },
  ];

  return (
    <section className="rounded-xl border border-black/5 bg-chow-surface p-4">
      <h2 className="font-semibold text-chow-ink">Timeline</h2>
      <ol className="mt-3 space-y-3">
        {steps.map((step) => {
          const done = Boolean(step.at);
          return (
            <li key={step.label} className="flex items-center gap-3 text-sm">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${done ? "bg-chow-green" : "bg-black/10"}`}
                aria-hidden
              />
              <span className={done ? "font-medium text-chow-ink" : "text-chow-muted"}>{step.label}</span>
              {step.at && <span className="tabular ml-auto text-xs text-chow-muted">{formatTime(step.at)}</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
