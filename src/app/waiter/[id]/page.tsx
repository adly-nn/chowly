import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeEffectiveStatus } from "@/lib/order-view";
import { formatNaira } from "@/lib/money";
import { StatusPill } from "@/components/StatusPill";
import { AssignmentPanel } from "@/components/AssignmentPanel";
import { WaiterComplaintList } from "@/components/WaiterComplaintList";

export default async function WaiterOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order, chefs, bartenders] = await Promise.all([
    prisma.order.findUnique({
      where: { OrderID: id },
      include: {
        Customer: true,
        OrderItems: { include: { MenuItem: true } },
        Complaints: { orderBy: { ComplaintDateTime: "desc" } },
        Rating: true,
      },
    }),
    prisma.chef.findMany({ orderBy: { ChefID: "asc" } }),
    prisma.bartender.findMany({ orderBy: { BartenderID: "asc" } }),
  ]);

  if (!order) notFound();

  const effectiveStatus = computeEffectiveStatus(order);
  const alreadyServed = order.OrderStatus === "SERVED" || order.OrderStatus === "PAID";
  const assigned = Boolean(order.ChefID && order.BartenderID);

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

      <section className="rounded-xl border border-black/5 bg-chow-surface p-4">
        <h2 className="font-semibold text-chow-ink">Items</h2>
        <ul className="mt-3 divide-y divide-black/5 text-sm">
          {order.OrderItems.map((item) => (
            <li key={item.OrderItemID} className="flex items-center justify-between py-2">
              <span className="text-chow-ink">
                {item.OrderItemQuantity}× {item.MenuItem.MenuItemName}
              </span>
              <span className="tabular font-medium text-chow-ink">{formatNaira(item.OrderItemSubTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
          <span className="font-semibold text-chow-ink">Total</span>
          <span className="tabular text-lg font-bold text-chow-ink">{formatNaira(order.OrderAmount)}</span>
        </div>
      </section>

      <AssignmentPanel
        orderId={order.OrderID}
        chefId={order.ChefID}
        bartenderId={order.BartenderID}
        chefs={chefs.map((c) => ({ id: c.ChefID, label: `${c.ChefName} · ${c.ChefSpecialty} · ${c.ChefShift}` }))}
        bartenders={bartenders.map((b) => ({ id: b.BartenderID, label: `${b.BartenderName} · ${b.BartenderShift}` }))}
        assigned={assigned}
        alreadyServed={alreadyServed}
      />

      <WaiterComplaintList orderId={order.OrderID} complaints={order.Complaints} />

      {order.Rating && (
        <section className="rounded-xl border border-black/5 bg-chow-surface p-4 text-sm">
          <h2 className="font-semibold text-chow-ink">Rating</h2>
          <p className="mt-1 text-chow-yellow" aria-hidden>
            {"★".repeat(order.Rating.RatingScore)}
            {"☆".repeat(5 - order.Rating.RatingScore)}
          </p>
          <p className="sr-only">{order.Rating.RatingScore} out of 5 stars</p>
          {order.Rating.RatingComment && <p className="mt-1 text-chow-muted">{order.Rating.RatingComment}</p>}
        </section>
      )}
    </div>
  );
}
