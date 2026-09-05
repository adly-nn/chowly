"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assignStaffSchema, markServedSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";

export async function assignStaff(orderId: string, chefId: string, bartenderId: string) {
  const session = await getSession();
  const parsed = assignStaffSchema.parse({
    orderId,
    waiterId: session.waiterId,
    chefId,
    bartenderId,
  });

  await prisma.order.update({
    where: { OrderID: parsed.orderId },
    data: {
      WaiterID: parsed.waiterId,
      ChefID: parsed.chefId,
      BartenderID: parsed.bartenderId,
      OrderStatus: "PREPARING",
      OrderPreparingAt: new Date(),
    },
  });

  revalidatePath("/waiter");
  revalidatePath(`/waiter/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
}

export async function markServed(orderId: string) {
  const parsed = markServedSchema.parse({ orderId });

  const order = await prisma.order.findUniqueOrThrow({ where: { OrderID: parsed.orderId } });
  if (!order.ChefID || !order.BartenderID) {
    throw new Error("Record a chef and a bartender before marking this order served");
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { OrderID: parsed.orderId },
      data: { OrderStatus: "SERVED", OrderServedAt: new Date() },
    }),
    prisma.orderItem.updateMany({
      where: { OrderID: parsed.orderId },
      data: { OrderItemStatus: "PREPARED" },
    }),
  ]);

  revalidatePath("/waiter");
  revalidatePath(`/waiter/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
}
