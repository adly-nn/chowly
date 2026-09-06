"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { createOrder } from "@/actions/orders";
import { computeWaitTime } from "@/lib/wait-time";
import { formatNaira } from "@/lib/money";

interface MenuItemVM {
  MenuItemID: string;
  MenuItemName: string;
  MenuItemDescription: string;
  MenuItemCategory: "Food" | "Drink";
  MenuItemPrice: number;
  MenuItemPrepTime: number;
  MenuItemAvailable: boolean;
  MenuItemImageUrl: string | null;
}

export function MenuBrowser({ items, queueCount }: { items: MenuItemVM[]; queueCount: number }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const itemsById = useMemo(() => new Map(items.map((i) => [i.MenuItemID, i])), [items]);

  const foodItems = items.filter((i) => i.MenuItemCategory === "Food");
  const drinkItems = items.filter((i) => i.MenuItemCategory === "Drink");

  const lines = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, quantity]) => ({ item: itemsById.get(id), quantity }))
    .filter((l): l is { item: MenuItemVM; quantity: number } => Boolean(l.item));

  const total = lines.reduce((sum, l) => sum + l.item.MenuItemPrice * l.quantity, 0);

  const estimatedWait = lines.length
    ? computeWaitTime(
        lines.map((l) => ({
          category: l.item.MenuItemCategory,
          prepTime: l.item.MenuItemPrepTime,
          quantity: l.quantity,
        })),
        queueCount,
      )
    : 0;

  function addItem(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  function setQuantity(id: string, qty: number) {
    setCart((c) => ({ ...c, [id]: Math.max(0, qty) }));
  }

  function submitOrder() {
    if (lines.length === 0) return;
    setError(null);
    startTransition(async () => {
      try {
        await createOrder(lines.map((l) => ({ menuItemId: l.item.MenuItemID, quantity: l.quantity })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not place the order. Please try again.");
      }
    });
  }

  return (
    <div className="grid gap-6 pb-52 md:grid-cols-[1fr_320px] md:pb-6">
      <div className="space-y-8">
        <MenuSection title="Food" items={foodItems} cart={cart} onAdd={addItem} onSetQuantity={setQuantity} />
        <MenuSection title="Drinks" items={drinkItems} cart={cart} onAdd={addItem} onSetQuantity={setQuantity} />
      </div>

      <CartPanel
        lines={lines}
        total={total}
        estimatedWait={estimatedWait}
        isPending={isPending}
        error={error}
        onSubmit={submitOrder}
      />
    </div>
  );
}

function MenuSection({
  title,
  items,
  cart,
  onAdd,
  onSetQuantity,
}: {
  title: string;
  items: MenuItemVM[];
  cart: Record<string, number>;
  onAdd: (id: string) => void;
  onSetQuantity: (id: string, qty: number) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-chow-ink" style={{ letterSpacing: "-0.02em" }}>
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <MenuCard
            key={item.MenuItemID}
            item={item}
            quantity={cart[item.MenuItemID] ?? 0}
            onAdd={() => onAdd(item.MenuItemID)}
            onSetQuantity={(qty) => onSetQuantity(item.MenuItemID, qty)}
          />
        ))}
      </div>
    </section>
  );
}

function MenuCard({
  item,
  quantity,
  onAdd,
  onSetQuantity,
}: {
  item: MenuItemVM;
  quantity: number;
  onAdd: () => void;
  onSetQuantity: (qty: number) => void;
}) {
  const unavailable = !item.MenuItemAvailable;

  return (
    <div className={`flex gap-3 rounded-xl border border-black/5 bg-chow-surface p-4 ${unavailable ? "opacity-50" : ""}`}>
      {item.MenuItemImageUrl && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-chow-green-wash">
          <Image
            src={item.MenuItemImageUrl}
            alt={item.MenuItemName}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-chow-ink">{item.MenuItemName}</h3>
        <p className="mt-0.5 text-sm text-chow-muted">{item.MenuItemDescription}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="tabular font-bold text-chow-ink">{formatNaira(item.MenuItemPrice)}</span>
            <span className="tabular text-xs text-chow-muted">{item.MenuItemPrepTime} min</span>
          </div>

          {unavailable ? (
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-chow-muted">
              Unavailable
            </span>
          ) : quantity > 0 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSetQuantity(quantity - 1)}
                aria-label={`Remove one ${item.MenuItemName}`}
                className="h-7 w-7 rounded-full bg-chow-green-wash font-semibold text-chow-green"
              >
                −
              </button>
              <span className="tabular w-4 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => onSetQuantity(quantity + 1)}
                aria-label={`Add one more ${item.MenuItemName}`}
                className="h-7 w-7 rounded-full bg-chow-green font-semibold text-white"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Add ${item.MenuItemName} to cart`}
              className="rounded-lg bg-chow-yellow px-3 py-1.5 text-sm font-semibold text-chow-ink"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartPanel({
  lines,
  total,
  estimatedWait,
  isPending,
  error,
  onSubmit,
}: {
  lines: { item: MenuItemVM; quantity: number }[];
  total: number;
  estimatedWait: number;
  isPending: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  const empty = lines.length === 0;

  return (
    <aside className="fixed inset-x-0 bottom-0 z-10 border-t border-black/5 bg-chow-surface p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:sticky md:top-6 md:h-fit md:rounded-xl md:border md:shadow-none">
      <h2 className="font-bold text-chow-ink">Your order</h2>

      {empty ? (
        <p className="mt-2 text-sm text-chow-muted">Nothing in your cart yet — tap an item to add it.</p>
      ) : (
        <>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
            {lines.map((l) => (
              <li key={l.item.MenuItemID} className="flex items-center justify-between gap-2">
                <span className="truncate">
                  {l.quantity}× {l.item.MenuItemName}
                </span>
                <span className="tabular shrink-0 font-medium">{formatNaira(l.item.MenuItemPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
            <span className="font-semibold text-chow-ink">Total</span>
            <span className="tabular text-lg font-bold text-chow-ink">{formatNaira(total)}</span>
          </div>

          <p className="tabular mt-2 text-sm text-chow-muted">Estimated wait if you order now: {estimatedWait} min</p>

          {error && <p className="mt-2 text-sm text-chow-alert">{error}</p>}

          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="mt-3 w-full rounded-lg bg-chow-yellow px-4 py-2.5 font-semibold text-chow-ink disabled:opacity-60"
          >
            {isPending ? "Placing order…" : "Place order"}
          </button>
        </>
      )}
    </aside>
  );
}
