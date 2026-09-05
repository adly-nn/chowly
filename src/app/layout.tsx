import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { RoleSwitch } from "@/components/RoleSwitch";
import { NavTabs } from "@/components/NavTabs";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Chowly — dine-in ordering",
  description: "Dine-in ordering platform for The Yellow Chilli.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const [customers, waiters, restaurant] = await Promise.all([
    prisma.customer.findMany({ orderBy: { CustomerID: "asc" } }),
    prisma.waiter.findMany({ orderBy: { WaiterID: "asc" } }),
    prisma.restaurant.findUnique({ where: { RestaurantID: "R001" } }),
  ]);

  const currentCustomer = customers.find((c) => c.CustomerID === session.customerId);
  const currentWaiter = waiters.find((w) => w.WaiterID === session.waiterId);

  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <header className="bg-chow-green text-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight">Chowly</span>
              <span className="hidden text-sm text-white/70 sm:inline">
                {restaurant?.RestaurantName ?? "The Yellow Chilli"}
              </span>
            </div>
            <RoleSwitch
              role={session.role}
              customerId={session.customerId}
              waiterId={session.waiterId}
              customers={customers.map((c) => ({
                id: c.CustomerID,
                label: `${c.CustomerName} · ${c.CustomerTableNo}`,
              }))}
              waiters={waiters.map((w) => ({
                id: w.WaiterID,
                label: `${w.WaiterName} · ${w.WaiterShift}`,
              }))}
            />
          </div>
          <div
            className={`mx-auto max-w-5xl px-4 pb-2 text-xs font-semibold uppercase tracking-wide sm:px-6 ${
              session.role === "customer" ? "text-chow-yellow" : "text-white/80"
            }`}
          >
            {session.role === "customer"
              ? `Customer view — Table ${currentCustomer?.CustomerTableNo ?? "?"}`
              : `Waiter view — ${currentWaiter?.WaiterName ?? "?"}`}
          </div>
          <NavTabs role={session.role} />
        </header>
        <main className="mx-auto min-h-screen max-w-5xl bg-chow-page px-4 py-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
