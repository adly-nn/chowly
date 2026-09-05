"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { simulateDelaySchema } from "@/lib/validation";

const BACKDATE_MINUTES = 45;

/**
 * Demo-only control (labelled honestly in the UI): back-dates OrderDateTime
 * so the order's computed deadline has already passed, exercising the
 * complaint/rating path without a real 45-minute wait.
 */
export async function simulateDelay(orderId: string) {
  const parsed = simulateDelaySchema.parse({ orderId });

  const order = await prisma.order.findUniqueOrThrow({ where: { OrderID: parsed.orderId } });
  const backdated = new Date(order.OrderDateTime.getTime() - BACKDATE_MINUTES * 60_000);

  await prisma.order.update({
    where: { OrderID: parsed.orderId },
    data: { OrderDateTime: backdated },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/waiter");
  revalidatePath(`/waiter/${orderId}`);
}
