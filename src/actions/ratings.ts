"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { nextId } from "@/lib/ids";
import { submitRatingSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";

export async function submitRating(orderId: string, score: number, comment?: string) {
  const session = await getSession();
  const parsed = submitRatingSchema.parse({
    orderId,
    customerId: session.customerId,
    score,
    comment,
  });

  const existing = await prisma.rating.findUnique({ where: { OrderID: parsed.orderId } });

  if (existing) {
    await prisma.rating.update({
      where: { OrderID: parsed.orderId },
      data: {
        RatingScore: parsed.score,
        RatingComment: parsed.comment ?? null,
        RatingDateTime: new Date(),
      },
    });
  } else {
    const ratingId = await nextId(prisma.rating, "RatingID", "RT");
    await prisma.rating.create({
      data: {
        RatingID: ratingId,
        RatingScore: parsed.score,
        RatingComment: parsed.comment ?? null,
        RatingDateTime: new Date(),
        OrderID: parsed.orderId,
        CustomerID: parsed.customerId,
      },
    });
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/waiter/${orderId}`);
}
