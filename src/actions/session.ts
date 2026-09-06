"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, setSession } from "@/lib/session";

export async function switchToCustomer(customerId: string) {
  const current = await getSession();
  const roleChanged = current.role !== "customer";
  await setSession({ ...current, role: "customer", customerId });
  revalidatePath("/", "layout");
  // Only bounce to the customer home when the *role* actually flipped —
  // picking a different customer while already in customer mode should
  // leave you on the page you're on.
  if (roleChanged) redirect("/menu");
}

export async function switchToWaiter(waiterId: string) {
  const current = await getSession();
  const roleChanged = current.role !== "waiter";
  await setSession({ ...current, role: "waiter", waiterId });
  revalidatePath("/", "layout");
  if (roleChanged) redirect("/waiter");
}
