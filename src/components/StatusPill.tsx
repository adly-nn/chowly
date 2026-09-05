const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-chow-green-wash text-chow-green",
  PREPARING: "bg-chow-yellow text-chow-ink",
  DELAYED: "bg-chow-alert text-white",
  SERVED: "bg-chow-green text-white",
  PAID: "bg-chow-green-deep text-white",
};

const STATUS_LABELS: Record<string, string> = {
  PLACED: "Placed",
  PREPARING: "Preparing",
  DELAYED: "Delayed",
  SERVED: "Served",
  PAID: "Paid",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-chow-green-wash text-chow-green"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
