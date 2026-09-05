import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeEffectiveStatus, computeEffectiveItemStatus } from "@/lib/order-view";
import { formatNaira } from "@/lib/money";
import { StatusPill } from "@/components/StatusPill";
import { WaitCountdown } from "@/components/WaitCountdown";
import { OrderTimeline } from "@/components/OrderTimeline";
import { ComplaintPanel } from "@/components/ComplaintPanel";
import { RatingPanel } from "@/components/RatingPanel";
import { PaymentPanel } from "@/components/PaymentPanel";
import { DemoDelayButton } from "@/components/DemoDelayButton";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { OrderID: id },
    include: {
      OrderItems: { include: { MenuItem: true } },
      Customer: true,
      Chef: true,
      Bartender: true,
      Payment: true,
      Complaints: { orderBy: { ComplaintDateTime: "desc" } },
      Rating: true,
    },
  });

  if (!order) notFound();

  const effectiveStatus = computeEffectiveStatus(order);
  const isActive = effectiveStatus !== "SERVED" && effectiveStatus !== "PAID";
  const isDelayed = effectiveStatus === "DELAYED";
  const deadline = new Date(order.OrderDateTime.getTime() + order.OrderWaitTime * 60_000).toISOString();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-chow-ink" style={{ letterSpacing: "-0.02em" }}>
            Order {order.OrderID}
          </h1>
          <p className="mt-1 text-sm text-chow-muted">
            Table {order.Customer.CustomerTableNo} · {order.Customer.CustomerName}
          </p>
        </div>
        <StatusPill status={effectiveStatus} />
      </div>

      {isActive && <WaitCountdown deadline={deadline} />}

      <section className="rounded-xl border border-black/5 bg-chow-surface p-4">
        <h2 className="font-semibold text-chow-ink">Items</h2>
        <ul className="mt-3 divide-y divide-black/5">
          {order.OrderItems.map((item) => {
            const itemStatus = computeEffectiveItemStatus(item.OrderItemStatus, effectiveStatus);
            return (
              <li key={item.OrderItemID} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-chow-ink">
                  {item.OrderItemQuantity}× {item.MenuItem.MenuItemName}
                </span>
                <span className="flex items-center gap-3">
                  <span className="tabular font-medium text-chow-ink">{formatNaira(item.OrderItemSubTotal)}</span>
                  <span className="text-xs text-chow-muted">{itemStatus}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
          <span className="font-semibold text-chow-ink">Total</span>
          <span className="tabular text-lg font-bold text-chow-ink">{formatNaira(order.OrderAmount)}</span>
        </div>
      </section>

      <OrderTimeline order={order} />

      {(order.Chef || order.Bartender) && (
        <section className="rounded-xl border border-black/5 bg-chow-surface p-4 text-sm">
          <h2 className="font-semibold text-chow-ink">Prepared by</h2>
          <p className="mt-1 text-chow-muted">
            {order.Chef ? `Chef ${order.Chef.ChefName}` : "Chef not yet assigned"}
            {" · "}
            {order.Bartender ? `Bartender ${order.Bartender.BartenderName}` : "Bartender not yet assigned"}
          </p>
        </section>
      )}

      {isActive && <DemoDelayButton orderId={order.OrderID} />}

      <ComplaintPanel orderId={order.OrderID} complaints={order.Complaints} prominent={isDelayed} />

      <RatingPanel orderId={order.OrderID} rating={order.Rating} />

      <PaymentPanel
        orderId={order.OrderID}
        orderAmount={order.OrderAmount}
        orderStatus={order.OrderStatus}
        payment={order.Payment}
      />
    </div>
  );
}
