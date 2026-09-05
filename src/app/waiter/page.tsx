import Link from "next/link";
import { prisma } from "@/lib/db";
import { computeEffectiveStatus, type EffectiveOrderStatus } from "@/lib/order-view";
import { formatNaira } from "@/lib/money";
import { StatusPill } from "@/components/StatusPill";

const STATUS_FILTERS = ["ALL", "PLACED", "PREPARING", "DELAYED", "SERVED", "PAID"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function isStatusFilter(value: string | undefined): value is StatusFilter {
  return Boolean(value) && (STATUS_FILTERS as readonly string[]).includes(value as string);
}

function timeSince(date: Date): string {
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function WaiterQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter: StatusFilter = isStatusFilter(status) ? status : "ALL";

  const [orders, ordersToday, revenueAgg, ratingAgg, openComplaints] = await Promise.all([
    prisma.order.findMany({
      orderBy: { OrderDateTime: "desc" },
      include: { Customer: true, OrderItems: true },
    }),
    prisma.order.count({ where: { OrderDateTime: { gte: startOfToday() } } }),
    prisma.payment.aggregate({ _sum: { PaymentAmount: true } }),
    prisma.rating.aggregate({ _avg: { RatingScore: true } }),
    prisma.complaint.count({ where: { ComplaintStatus: "OPEN" } }),
  ]);

  const rows = orders
    .map((order) => ({
      order,
      effectiveStatus: computeEffectiveStatus(order),
      itemCount: order.OrderItems.reduce((sum, i) => sum + i.OrderItemQuantity, 0),
    }))
    .filter((row) => filter === "ALL" || row.effectiveStatus === (filter as EffectiveOrderStatus));

  return (
    <div>
      <h1 className="text-2xl font-bold text-chow-ink" style={{ letterSpacing: "-0.02em" }}>
        Order queue
      </h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Orders today" value={String(ordersToday)} />
        <SummaryTile label="Revenue collected" value={formatNaira(revenueAgg._sum.PaymentAmount ?? 0)} />
        <SummaryTile
          label="Average rating"
          value={ratingAgg._avg.RatingScore ? ratingAgg._avg.RatingScore.toFixed(1) : "—"}
        />
        <SummaryTile label="Open complaints" value={String(openComplaints)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/waiter" : `/waiter?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === s ? "bg-chow-green text-white" : "bg-black/5 text-chow-muted"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-black/5 bg-chow-surface p-6 text-center text-sm text-chow-muted">
          {filter === "DELAYED" ? "No delayed orders right now — good." : "No orders match this filter."}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-black/5 rounded-xl border border-black/5 bg-chow-surface">
          {rows.map(({ order, effectiveStatus, itemCount }) => (
            <li key={order.OrderID}>
              <Link
                href={`/waiter/${order.OrderID}`}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-black/[0.02] ${
                  effectiveStatus === "DELAYED" ? "border-l-4 border-chow-alert" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-chow-ink">
                    {order.OrderID} · Table {order.Customer.CustomerTableNo}
                  </p>
                  <p className="truncate text-xs text-chow-muted">
                    {order.Customer.CustomerName} · {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
                    {timeSince(order.OrderDateTime)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="tabular font-semibold text-chow-ink">{formatNaira(order.OrderAmount)}</span>
                  <StatusPill status={effectiveStatus} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-chow-surface p-3">
      <p className="text-xs text-chow-muted">{label}</p>
      <p className="tabular mt-1 text-lg font-bold text-chow-ink">{value}</p>
    </div>
  );
}
