"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavTabs({ role }: { role: "customer" | "waiter" }) {
  const pathname = usePathname();

  const links =
    role === "customer"
      ? [
          { href: "/menu", label: "Menu" },
          { href: "/orders", label: "My orders" },
        ]
      : [{ href: "/waiter", label: "Order queue" }];

  return (
    <nav className="flex gap-1 px-4 sm:px-6" aria-label="Primary">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-chow-page text-chow-ink" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
