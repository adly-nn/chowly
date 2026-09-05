"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { nextId } from "@/lib/ids";
import { submitComplaintSchema, resolveComplaintSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";

export async function submitComplaint(orderId: string, description: string) {
  const session = await getSession();
  const parsed = submitComplaintSchema.parse({
    orderId,
    customerId: session.customerId,
    description,
  });

  const complaintId = await nextId(prisma.complaint, "ComplaintID", "CM");

  await prisma.complaint.create({
    data: {
      ComplaintID: complaintId,
      ComplaintDescription: parsed.description,
      ComplaintDateTime: new Date(),
      ComplaintStatus: "OPEN",
      OrderID: parsed.orderId,
      CustomerID: parsed.customerId,
    },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/waiter/${orderId}`);
}

export async function resolveComplaint(complaintId: string, orderId: string) {
  const parsed = resolveComplaintSchema.parse({ complaintId });

  await prisma.complaint.update({
    where: { ComplaintID: parsed.complaintId },
    data: { ComplaintStatus: "RESOLVED" },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/waiter/${orderId}`);
}
