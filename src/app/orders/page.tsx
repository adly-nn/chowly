import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { computeEffectiveStatus } from "@/lib/order-view";
import { formatNaira } from "@/lib/money";
import { StatusPill } from "@/components/StatusPill";

export default async function MyOrdersPage() {
  const session = await getSession();

  const orders = await prisma.order.findMany({
    where: { CustomerID: session.customerId },
    orderBy: { OrderDateTime: "desc" },
    include: { OrderItems: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-chow-ink" style={{ letterSpacing: "-0.02em" }}>
        My orders
      </h1>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-black/5 bg-chow-surface p-6 text-center">
          <p className="font-medium text-chow-ink">No orders yet</p>
          <p className="mt-1 text-sm text-chow-muted">
            Head to the menu and build your first order — it will show up here the moment you submit it.
          </p>
          <Link
            href="/menu"
            className="mt-4 inline-block rounded-lg bg-chow-yellow px-4 py-2 text-sm font-semibold text-chow-ink"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => {
            const effectiveStatus = computeEffectiveStatus(order);
            const itemCount = order.OrderItems.reduce((sum, i) => sum + i.OrderItemQuantity, 0);
            return (
              <li key={order.OrderID}>
                <Link
                  href={`/orders/${order.OrderID}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-chow-surface p-4 hover:border-chow-green/30"
                >
                  <div>
                    <p className="font-semibold text-chow-ink">{order.OrderID}</p>
                    <p className="text-sm text-chow-muted">
                      {itemCount} item{itemCount === 1 ? "" : "s"} · {order.OrderDateTime.toLocaleString("en-NG")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular font-semibold text-chow-ink">{formatNaira(order.OrderAmount)}</span>
                    <StatusPill status={effectiveStatus} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
