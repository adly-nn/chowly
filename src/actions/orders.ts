"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { nextId } from "@/lib/ids";
import { computeWaitTime } from "@/lib/wait-time";
import { createOrderSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";

export async function createOrder(lines: { menuItemId: string; quantity: number }[]) {
  const session = await getSession();
  const parsed = createOrderSchema.parse({ customerId: session.customerId, lines });

  const orderId = await prisma.$transaction(async (tx) => {
    const menuItems = await tx.menuItem.findMany({
      where: { MenuItemID: { in: parsed.lines.map((l) => l.menuItemId) } },
    });
    const itemsById = new Map(menuItems.map((m) => [m.MenuItemID, m]));

    const orderLines = parsed.lines.map((line) => {
      const item = itemsById.get(line.menuItemId);
      if (!item) throw new Error(`Menu item ${line.menuItemId} does not exist`);
      if (!item.MenuItemAvailable) throw new Error(`${item.MenuItemName} is no longer available`);
      return {
        menuItem: item,
        quantity: line.quantity,
        subtotal: item.MenuItemPrice * line.quantity,
      };
    });

    const orderAmount = orderLines.reduce((sum, l) => sum + l.subtotal, 0);

    const queueCount = await tx.order.count({
      where: { OrderStatus: { in: ["PLACED", "PREPARING"] } },
    });

    const waitTime = computeWaitTime(
      orderLines.map((l) => ({
        category: l.menuItem.MenuItemCategory,
        prepTime: l.menuItem.MenuItemPrepTime,
        quantity: l.quantity,
      })),
      queueCount,
    );

    const newOrderId = await nextId(tx.order, "OrderID", "O", 3);

    await tx.order.create({
      data: {
        OrderID: newOrderId,
        OrderDateTime: new Date(),
        OrderStatus: "PLACED",
        OrderAmount: orderAmount,
        OrderWaitTime: waitTime,
        CustomerID: parsed.customerId,
      },
    });

    for (const line of orderLines) {
      const orderItemId = await nextId(tx.orderItem, "OrderItemID", "OI");
      await tx.orderItem.create({
        data: {
          OrderItemID: orderItemId,
          OrderItemQuantity: line.quantity,
          OrderItemSubTotal: line.subtotal,
          OrderItemStatus: "PENDING",
          OrderID: newOrderId,
          MenuItemID: line.menuItem.MenuItemID,
        },
      });
    }

    return newOrderId;
  });

  revalidatePath("/waiter");
  revalidatePath("/orders");
  redirect(`/orders/${orderId}`);
}
