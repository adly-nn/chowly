"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { nextId } from "@/lib/ids";
import { recordPaymentSchema } from "@/lib/validation";

export async function recordPayment(orderId: string, method: "Card" | "Transfer" | "Cash") {
  const parsed = recordPaymentSchema.parse({ orderId, method });

  const order = await prisma.order.findUniqueOrThrow({ where: { OrderID: parsed.orderId } });

  const existingPayment = await prisma.payment.findUnique({ where: { OrderID: parsed.orderId } });
  if (existingPayment) {
    // Idempotent: a second click (or a stray resubmit) just shows the existing receipt.
    return;
  }

  if (order.OrderStatus !== "SERVED") {
    throw new Error("Payment is only available once the order has been served");
  }

  const paymentId = await nextId(prisma.payment, "PaymentID", "PY");

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        PaymentID: paymentId,
        PaymentAmount: order.OrderAmount,
        PaymentMethod: parsed.method,
        PaymentDateTime: new Date(),
        PaymentStatus: "SUCCESSFUL",
        OrderID: parsed.orderId,
      },
    }),
    prisma.order.update({
      where: { OrderID: parsed.orderId },
      data: { OrderStatus: "PAID" },
    }),
  ]);

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/waiter");
  revalidatePath(`/waiter/${orderId}`);
}
