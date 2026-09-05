import { prisma } from "@/lib/db";
import { MenuBrowser } from "@/components/MenuBrowser";

export default async function MenuPage() {
  const [items, queueCount] = await Promise.all([
    prisma.menuItem.findMany({
      where: { RestaurantID: "R001" },
      orderBy: { MenuItemID: "asc" },
    }),
    prisma.order.count({ where: { OrderStatus: { in: ["PLACED", "PREPARING"] } } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-chow-ink" style={{ letterSpacing: "-0.02em" }}>
        Menu
      </h1>
      <p className="mt-1 text-sm text-chow-muted">Browse the menu and build your order below.</p>
      <div className="mt-6">
        <MenuBrowser items={items} queueCount={queueCount} />
      </div>
    </div>
  );
}
