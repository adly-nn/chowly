"use server";

import { revalidatePath } from "next/cache";
import { getSession, setSession } from "@/lib/session";
import type { Role } from "@/lib/session";

export async function switchToCustomer(customerId: string) {
  const current = await getSession();
  await setSession({ ...current, role: "customer", customerId });
  revalidatePath("/", "layout");
}

export async function switchToWaiter(waiterId: string) {
  const current = await getSession();
  await setSession({ ...current, role: "waiter", waiterId });
  revalidatePath("/", "layout");
}

export async function switchRole(role: Role, id: string) {
  if (role === "customer") {
    await switchToCustomer(id);
  } else {
    await switchToWaiter(id);
  }
}
