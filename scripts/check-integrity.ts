/**
 * Money-integrity check (brief §3.4): re-reads every Order in the database
 * and proves the arithmetic reconciles exactly, by hand rules rather than
 * convention:
 *   - every OrderItemSubTotal equals MenuItemPrice x OrderItemQuantity
 *   - every OrderAmount equals the sum of its OrderItemSubTotal rows
 *   - every Payment.PaymentAmount equals its Order.OrderAmount
 *
 * Run with `npm run db:verify`. Exits non-zero on the first mismatch found.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: { OrderItems: { include: { MenuItem: true } }, Payment: true },
  });

  let checked = 0;
  const problems: string[] = [];

  for (const order of orders) {
    for (const item of order.OrderItems) {
      const expected = item.MenuItem.MenuItemPrice * item.OrderItemQuantity;
      if (expected !== item.OrderItemSubTotal) {
        problems.push(
          `${order.OrderID} / ${item.OrderItemID}: subtotal ${item.OrderItemSubTotal} != price*qty ${expected}`,
        );
      }
      checked += 1;
    }

    const sum = order.OrderItems.reduce((s, i) => s + i.OrderItemSubTotal, 0);
    if (sum !== order.OrderAmount) {
      problems.push(`${order.OrderID}: OrderAmount ${order.OrderAmount} != sum of subtotals ${sum}`);
    }

    if (order.Payment && order.Payment.PaymentAmount !== order.OrderAmount) {
      problems.push(
        `${order.OrderID}: PaymentAmount ${order.Payment.PaymentAmount} != OrderAmount ${order.OrderAmount}`,
      );
    }
  }

  if (problems.length > 0) {
    console.error(`Integrity check FAILED (${problems.length} problem(s)):`);
    for (const p of problems) console.error(" - " + p);
    process.exit(1);
  }

  console.log(
    `Integrity check passed: ${orders.length} order(s), ${checked} order item(s) all reconcile exactly.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
